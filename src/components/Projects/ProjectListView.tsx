
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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

  // Helper function to get creator initials
  const getCreatorInitials = (project: ProjectWithRelations) => {
    if (project.creator && (project.creator.first_name || project.creator.last_name)) {
      const first = project.creator.first_name?.[0] || '';
      const last = project.creator.last_name?.[0] || '';
      return (first + last).toUpperCase();
    }
    return 'U';
  };

  // Helper function to get creator full name
  const getCreatorName = (project: ProjectWithRelations) => {
    if (project.creator) {
      const firstName = project.creator.first_name || '';
      const lastName = project.creator.last_name || '';
      const name = `${firstName} ${lastName}`.trim();
      return name || 'Unknown User';
    }
    return 'Unknown User';
  };
  
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
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
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
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 text-xs">
                        <AvatarImage src={project.creator?.avatar_url || undefined} />
                        <AvatarFallback>{getCreatorInitials(project)}</AvatarFallback>
                      </Avatar>
                      <span>{getCreatorName(project)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{safeFormatDate(project.created_at)}</TableCell>
                  <TableCell>{safeFormatDate(project.deadline)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
              This action cannot be undone. This will permanently delete the project and all associated data.
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

