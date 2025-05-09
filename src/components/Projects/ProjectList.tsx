
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Project, User } from '@/types/project';
import ProjectCreateDialog from './ProjectCreateDialog';

// UI components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock, Building, Users, Banknote } from 'lucide-react';

interface ProjectListProps {
  projects: Array<Project & {
    company: { name: string; };
    creator: User;
  }> | undefined;
  isLoading: boolean;
  companies: Array<{ id: string; name: string }>;
}

export default function ProjectList({ projects, isLoading, companies }: ProjectListProps) {
  const { isAdmin, isEmployee } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const canCreateProjects = isAdmin || isEmployee;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h3 className="text-xl font-semibold mb-2">No projects found</h3>
        <p className="text-muted-foreground mb-6">
          {canCreateProjects
            ? "Create your first project to get started"
            : "You don't have any projects assigned yet"}
        </p>
        {canCreateProjects && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Create New Project
          </Button>
        )}
        
        {isCreateDialogOpen && (
          <ProjectCreateDialog
            isOpen={isCreateDialogOpen}
            onClose={() => setIsCreateDialogOpen(false)}
            companies={companies}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Projects ({projects.length})</h2>
        {canCreateProjects && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Create New Project
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link to={`/projects/${project.id}`} key={project.id}>
            <Card className="h-full transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="line-clamp-2">{project.name}</CardTitle>
                <CardDescription className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {project.company.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {project.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {project.description}
                  </p>
                )}
                
                <div className="flex flex-col space-y-2">
                  {project.value && (
                    <div className="flex items-center text-sm">
                      <Banknote className="h-4 w-4 mr-2" />
                      <span>{new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK' }).format(project.value)}</span>
                      {project.price_type && (
                        <Badge className="ml-2" variant="outline">
                          {project.price_type === 'fixed' ? 'Fixed Price' : 'Estimated'}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {project.deadline && (
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span>Due {format(new Date(project.deadline), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Created {format(new Date(project.created_at), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {isCreateDialogOpen && (
        <ProjectCreateDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          companies={companies}
        />
      )}
    </div>
  );
}
