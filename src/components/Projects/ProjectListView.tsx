
import React from 'react';
import { format } from 'date-fns';
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

interface ProjectListViewProps {
  projects: ProjectWithRelations[];
  onProjectSelect: (projectId: string) => void;
  selectedProjectId: string | null;
}

export const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  onProjectSelect,
  selectedProjectId,
}) => {
  // Helper function to get creator initials
  const getCreatorInitials = (project: ProjectWithRelations) => {
    if (project.creator && (project.creator.first_name || project.creator.last_name)) {
      const first = project.creator.first_name?.[0] || '';
      const last = project.creator.last_name?.[0] || '';
      return (first + last).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Price Type</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Deadline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map(project => (
              <TableRow 
                key={project.id}
                className={`cursor-pointer hover:bg-gray-100 ${project.id === selectedProjectId ? 'bg-muted' : ''}`}
                onClick={() => onProjectSelect(project.id)}
              >
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.company?.name || 'Unknown'}</TableCell>
                <TableCell>{project.value.toLocaleString()} NOK</TableCell>
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
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={project.creator?.avatar_url || undefined} />
                      <AvatarFallback>{getCreatorInitials(project)}</AvatarFallback>
                    </Avatar>
                    <span>
                      {project.creator 
                        ? `${project.creator.first_name || ''} ${project.creator.last_name || ''}`.trim() || 'Unknown'
                        : 'Unknown'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{format(new Date(project.created_at), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  {project.deadline 
                    ? format(new Date(project.deadline), 'MMM dd, yyyy')
                    : 'No deadline'}
                </TableCell>
              </TableRow>
            ))}
            {projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No projects found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
