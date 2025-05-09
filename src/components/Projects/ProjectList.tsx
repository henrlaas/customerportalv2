
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Users, 
  MoreHorizontal,
  Trash2,
  Edit
} from 'lucide-react';
import { ProjectWithRelations, Project } from '@/types/project';
import { format } from 'date-fns';
import { formatCurrency } from '@/components/Deals/utils/formatters';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';

interface ProjectListProps {
  projects: ProjectWithRelations[];
  isLoading: boolean;
  canCreate: boolean;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onCreateNew: () => void;
}

export const ProjectList = ({
  projects,
  isLoading,
  canCreate,
  onEdit,
  onDelete,
  onCreateNew,
}: ProjectListProps) => {
  const navigate = useNavigate();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleViewProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        {canCreate && (
          <Button onClick={onCreateNew}>
            Create Project
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col justify-center items-center h-40">
            <p className="text-gray-500 mb-4">No projects created yet. Projects will appear here once created.</p>
            {canCreate && (
              <Button onClick={onCreateNew}>
                Create Your First Project
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-start">
                  <span 
                    className="cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleViewProject(project.id)}
                  >
                    {project.name}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewProject(project.id)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(project)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => setProjectToDelete(project.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardTitle>
                <CardDescription>
                  {project.company?.name && (
                    <div className="flex items-center gap-1 mt-1">
                      <Users className="h-3.5 w-3.5" />
                      <span className="text-xs">{project.company.name}</span>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {project.description && (
                    <p className="line-clamp-2 mb-2">{project.description}</p>
                  )}
                  <div className="flex flex-col gap-2">
                    {project.value && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span>{formatCurrency(project.value)}</span>
                        {project.price_type && (
                          <Badge variant="outline" className="ml-1">
                            {project.price_type === 'fixed' ? 'Fixed' : 'Estimated'}
                          </Badge>
                        )}
                      </div>
                    )}
                    {project.deadline && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{format(new Date(project.deadline), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{format(new Date(project.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 pb-2">
                {project.assignees && project.assignees.length > 0 ? (
                  <div className="w-full flex justify-between items-center">
                    <span className="text-xs text-gray-500">Assigned to:</span>
                    <UserAvatarGroup 
                      users={project.assignees.map(a => ({
                        id: a.id,
                        firstName: a.first_name || '',
                        lastName: a.last_name || '',
                        avatarUrl: a.avatar_url || null
                      }))}
                      max={3}
                    />
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">No assignees</span>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this project, its milestones, and the association with any tasks or time entries.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (projectToDelete) {
                  onDelete(projectToDelete);
                  setProjectToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
