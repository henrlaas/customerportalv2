
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ClockIcon, CalendarIcon } from 'lucide-react';
import { ProjectWithRelations } from '@/hooks/useProjects';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: ProjectWithRelations;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ProjectCard = ({ project, isSelected = false, onClick }: ProjectCardProps) => {
  // Format deadline if available
  const deadline = project.deadline 
    ? format(new Date(project.deadline), 'MMM dd, yyyy')
    : null;

  // Creator name
  const creatorName = project.creator 
    ? `${project.creator.first_name || ''} ${project.creator.last_name || ''}`.trim() || 'Unknown'
    : 'Unknown';

  // Get creatorInitials
  const getCreatorInitials = () => {
    if (project.creator && (project.creator.first_name || project.creator.last_name)) {
      const first = project.creator.first_name?.[0] || '';
      const last = project.creator.last_name?.[0] || '';
      return (first + last).toUpperCase();
    }
    return 'U';
  };
  
  return (
    <Card 
      className={cn(
        "transition-all cursor-pointer hover:border-primary",
        isSelected ? "border-primary border-2" : "border-border"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="text-lg font-bold">{project.name}</div>
        <Badge 
          variant={project.price_type === 'fixed' ? 'default' : 'secondary'} 
          className="capitalize"
        >
          {project.price_type === 'fixed' ? 'Fixed Price' : 'Estimated'}
        </Badge>
      </CardHeader>
      
      <CardContent>
        {project.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {project.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm">
            <div className="font-medium">{project.company?.name || 'Unknown Company'}</div>
            <div className="text-muted-foreground">{project.value.toLocaleString()} NOK</div>
          </div>
          
          <Avatar className="h-8 w-8">
            <AvatarImage src={project.creator?.avatar_url || undefined} alt={creatorName} />
            <AvatarFallback>{getCreatorInitials()}</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
          <div className="flex items-center">
            <ClockIcon className="h-3 w-3 mr-1" />
            <span>{format(new Date(project.created_at), 'MMM dd, yyyy')}</span>
          </div>
          
          {deadline && (
            <div className="flex items-center">
              <CalendarIcon className="h-3 w-3 mr-1" />
              <span>{deadline}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
