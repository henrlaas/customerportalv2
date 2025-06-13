
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
import { useOptimizedProjectAssignees } from '@/hooks/useOptimizedProjectAssignees';
import { getProjectStatus, getProjectStatusBadge } from '@/utils/projectStatus';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectListViewProps {
  projects: ProjectWithRelations[];
  selectedProjectId: string | null;
  onDeleteProject?: (projectId: string) => Promise<void>;
  projectMilestones?: Record<string, any[]>;
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  selectedProjectId,
  onDeleteProject,
  projectMilestones = {},
}) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<string | null>(null);

  console.log('ProjectListView render - projects:', projects.length, 'milestones keys:', Object.keys(projectMilestones).length);

  // Get project IDs for assignee fetching
  const projectIds = projects.map(p => p.id);
  
  // Fetch assignees using the optimized hook
  const { data: projectAssignees = {}, isLoading: assigneesLoading, error: assigneesError } = useOptimizedProjectAssignees(projectIds);

  // Log errors for debugging
  React.useEffect(() => {
    if (assigneesError) {
      console.error('Assignees query error:', assigneesError);
    }
  }, [assigneesError]);
  
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

  // Safe currency formatting function
  const safeFormatCurrency = (value: number | null | undefined): string => {
    if (value == null || value === undefined) return 'N/A';
    if (typeof value !== 'number' || isNaN(value)) return 'N/A';
    
    try {
      return value.toLocaleString();
    } catch (error) {
      console.error('Error formatting currency:', error);
      return 'N/A';
    }
  };

  const handleProjectClick = (projectId: string) => {
    try {
      console.log('Navigating to project:', projectId);
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error('Failed to navigate to project');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    console.log('Delete clicked for project:', projectId);
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (projectToDelete && onDeleteProject) {
      try {
        console.log('Confirming delete for project:', projectToDelete);
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
    
    console.log('Project', projectId, 'status:', status, 'milestones:', milestones.length);
    
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
                // Safely get project data with fallbacks
                const projectName = project.name || 'Unnamed Project';
                const projectValue = safeFormatCurrency(project.value);
                const priceType = project.price_type || 'estimated';
                const companyName = project.company?.name || 'No Company';
                const assignees = projectAssignees[project.id] || [];
                
                console.log('Rendering project:', project.id, projectName, 'assignees:', assignees.length);
                
                return (
                  <TableRow 
                    key={project.id}
                    className={`cursor-pointer hover:bg-gray-100 ${project.id === selectedProjectId ? 'bg-muted' : ''}`}
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <TableCell className="font-medium">{projectName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {project.company ? (
                          <>
                            <CompanyFavicon 
                              companyName={project.company.name} 
                              website={project.company.website} 
                              size="sm" 
                            />
                            <span>{project.company.name}</span>
                          </>
                        ) : (
                          <span className="text-gray-500">{companyName}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{projectValue} NOK</TableCell>
                    <TableCell>
                      <Badge 
                        variant={priceType === 'fixed' ? 'default' : 'secondary'} 
                        className={`capitalize ${
                          priceType === 'fixed'
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {priceType === 'fixed' ? 'Fixed Price' : 'Estimated'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {assigneesLoading ? (
                        <div className="flex -space-x-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                      ) : assignees && assignees.length > 0 ? (
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
