
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

export const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  selectedProjectId,
  onDeleteProject,
}) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<string | null>(null);

  // Fetch project assignees for all projects
  const { data: projectAssignees } = useQuery({
    queryKey: ['project-assignees-all'],
    queryFn: async () => {
      if (!projects.length) return {};
      
      const projectIds = projects.map(project => project.id);
      
      // First, fetch the project assignees
      const { data: assigneesData, error: assigneesError } = await supabase
        .from('project_assignees')
        .select('project_id, user_id')
        .in('project_id', projectIds);
      
      if (assigneesError) {
        console.error('Error fetching project assignees:', assigneesError);
        return {};
      }
      
      // Then, fetch the profile information for each user
      const assigneesByProject = {};
      
      // Group assignees by project_id first
      for (const assignee of assigneesData) {
        if (!assigneesByProject[assignee.project_id]) {
          assigneesByProject[assignee.project_id] = [];
        }
        
        // Fetch profile data for this user
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .eq('id', assignee.user_id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }
        
        if (profileData) {
          assigneesByProject[assignee.project_id].push({
            id: assignee.user_id,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            avatar_url: profileData.avatar_url
          });
        }
      }
      
      return assigneesByProject;
    },
    enabled: projects.length > 0
  });

  // Fetch milestones for all projects to determine status
  const { data: projectMilestones } = useQuery({
    queryKey: ['project-milestones-all'],
    queryFn: async () => {
      if (!projects.length) return {};
      
      const projectIds = projects.map(project => project.id);
      
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .in('project_id', projectIds)
        .order('created_at', { ascending: true });
      
      if (milestonesError) {
        console.error('Error fetching project milestones:', milestonesError);
        return {};
      }
      
      // Group milestones by project_id
      const milestonesByProject = {};
      for (const milestone of milestonesData) {
        if (!milestonesByProject[milestone.project_id]) {
          milestonesByProject[milestone.project_id] = [];
        }
        milestonesByProject[milestone.project_id].push(milestone);
      }
      
      return milestonesByProject;
    },
    enabled: projects.length > 0
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
    navigate(`/projects/${projectId}`);
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
    const milestones = projectMilestones?.[projectId] || [];
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
              {projects.map(project => (
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
                    {projectAssignees && projectAssignees[project.id] && projectAssignees[project.id].length > 0 ? (
                      <UserAvatarGroup 
                        users={projectAssignees[project.id]} 
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
              ))}
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
