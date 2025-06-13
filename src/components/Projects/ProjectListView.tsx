
import React from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProjectWithRelations } from '@/hooks/useProjects';
import { CompanyFavicon } from '@/components/CompanyFavicon';
import { Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getProjectStatus, getProjectStatusBadge } from '@/utils/projectStatus';

interface ProjectListViewProps {
  projects: ProjectWithRelations[];
  selectedProjectId: string | null;
  onDeleteProject?: (projectId: string) => Promise<void>;
}

interface ProjectAssignee {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface ProjectMilestone {
  id: string;
  project_id: string;
  status: 'created' | 'completed';
  name: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  selectedProjectId,
  onDeleteProject,
}) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<string | null>(null);

  // Fetch project assignees for all projects in a single optimized query
  const { data: projectAssignees = {} } = useQuery({
    queryKey: ['project-assignees-optimized', projects.map(p => p.id)],
    queryFn: async () => {
      if (!projects.length) return {};
      
      const projectIds = projects.map(project => project.id);
      
      try {
        // Get all assignees for all projects
        const { data: assigneesData, error: assigneesError } = await supabase
          .from('project_assignees')
          .select('project_id, user_id')
          .in('project_id', projectIds);
        
        if (assigneesError) {
          console.error('Error fetching project assignees:', assigneesError);
          return {};
        }

        if (!assigneesData || assigneesData.length === 0) {
          return {};
        }

        // Get all unique user IDs
        const userIds = Array.from(new Set(assigneesData.map(a => a.user_id)));
        
        // Fetch profiles for these users
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .in('id', userIds);
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          return {};
        }

        // Create a map of profiles for quick lookup
        const profilesMap = Object.fromEntries(
          (profilesData || []).map(profile => [profile.id, profile])
        );
        
        // Group assignees by project_id with profile data
        const assigneesByProject: Record<string, ProjectAssignee[]> = {};
        
        for (const assignee of assigneesData) {
          if (!assigneesByProject[assignee.project_id]) {
            assigneesByProject[assignee.project_id] = [];
          }
          
          const profile = profilesMap[assignee.user_id];
          if (profile) {
            assigneesByProject[assignee.project_id].push({
              id: assignee.user_id,
              first_name: profile.first_name,
              last_name: profile.last_name,
              avatar_url: profile.avatar_url
            });
          }
        }
        
        return assigneesByProject;
      } catch (error) {
        console.error('Error in project assignees query:', error);
        return {};
      }
    },
    enabled: projects.length > 0,
    staleTime: 30000, // 30 seconds
    retry: 2
  });

  // Fetch milestones for all projects in a single query
  const { data: projectMilestones = {} } = useQuery({
    queryKey: ['project-milestones-optimized', projects.map(p => p.id)],
    queryFn: async () => {
      if (!projects.length) return {};
      
      const projectIds = projects.map(project => project.id);
      
      try {
        const { data: milestonesData, error: milestonesError } = await supabase
          .from('milestones')
          .select('id, project_id, status, name, due_date, created_at, updated_at')
          .in('project_id', projectIds);
        
        if (milestonesError) {
          console.error('Error fetching project milestones:', milestonesError);
          return {};
        }
        
        // Group milestones by project_id
        const milestonesByProject: Record<string, ProjectMilestone[]> = {};
        for (const milestone of milestonesData || []) {
          if (!milestonesByProject[milestone.project_id]) {
            milestonesByProject[milestone.project_id] = [];
          }
          milestonesByProject[milestone.project_id].push({
            id: milestone.id,
            project_id: milestone.project_id,
            status: milestone.status,
            name: milestone.name,
            due_date: milestone.due_date,
            created_at: milestone.created_at,
            updated_at: milestone.updated_at
          });
        }
        
        return milestonesByProject;
      } catch (error) {
        console.error('Error in project milestones query:', error);
        return {};
      }
    },
    enabled: projects.length > 0,
    staleTime: 30000, // 30 seconds
    retry: 2
  });
  
  // Helper function to safely format dates
  const safeFormatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'MMM dd, yyyy') : 'Invalid date';
    } catch (error) {
      console.error(`Error formatting date: ${dateString}`, error);
      return 'Invalid date';
    }
  };

  const handleProjectClick = (projectId: string) => {
    try {
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Failed to navigate to project');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation(); // Prevent row click from triggering
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (projectToDelete && onDeleteProject) {
      try {
        await onDeleteProject(projectToDelete);
        toast.success("Project deleted successfully");
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error("Failed to delete project");
      }
    }
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  // Helper function to get project status badge
  const getProjectStatusForDisplay = (projectId: string) => {
    const milestones = projectMilestones[projectId] || [];
    const status = getProjectStatus(milestones);
    const statusBadge = getProjectStatusBadge(status);
    
    return (
      <Badge variant="outline" className={statusBadge.className}>
        {statusBadge.label}
      </Badge>
    );
  };

  return (
    <>
      <div className="border border-gray-200 rounded-xl overflow-hidden w-full">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Price Type</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="w-10">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map(project => {
                const assignees = projectAssignees[project.id] || [];
                
                return (
                  <TableRow 
                    key={project.id}
                    className={`cursor-pointer hover:bg-gray-100 ${project.id === selectedProjectId ? 'bg-muted' : ''}`}
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {project.company && (
                          <>
                            <CompanyFavicon 
                              companyName={project.company.name} 
                              website={project.company.website} 
                              size="sm" 
                            />
                            <span>{project.company.name}</span>
                          </>
                        )}
                        {!project.company && 'No Company'}
                      </div>
                    </TableCell>
                    <TableCell>{project.value?.toLocaleString() || 'N/A'} NOK</TableCell>
                    <TableCell>
                      <Badge 
                        variant={project.price_type === 'fixed' ? 'default' : 'secondary'} 
                        className={`capitalize ${
                          project.price_type === 'fixed'
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {project.price_type === 'fixed' ? 'Fixed Price' : 'Estimated'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {assignees && assignees.length > 0 ? (
                        <UserAvatarGroup 
                          users={assignees} 
                          size="sm"
                        />
                      ) : (
                        <span className="text-gray-500 text-sm">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>{getProjectStatusForDisplay(project.id)}</TableCell>
                    <TableCell>{safeFormatDate(project.deadline)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => handleDeleteClick(e, project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No projects found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project and all associated data including contracts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
