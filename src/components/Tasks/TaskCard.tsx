
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle, Eye, EyeOff, Building, Link } from 'lucide-react';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  client_visible: boolean | null;
  creator_id: string | null;
  company_id: string | null;
  campaign_id: string | null;
  project_id: string | null;
  related_type: string | null;
  assignees?: { id: string; user_id: string }[];
}

interface Contact {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
}

interface TaskCardProps {
  task: Task;
  getPriorityBadge: (priority: string) => React.ReactNode;
  getTaskAssignees: (task: Task) => Contact[];
  onClick: () => void;
  isDragging: boolean;
  getCreatorInfo: (creatorId: string | null) => Contact | null;
  getCompanyName: (companyId: string | null) => string | null;
  getCampaignName: (campaignId: string | null) => string | null;
  getProjectName: (projectId: string | null) => string | null;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  getPriorityBadge,
  getTaskAssignees,
  onClick,
  isDragging,
  getCreatorInfo,
  getCompanyName,
  getCampaignName,
  getProjectName
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  // Check if the task is overdue
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  // Get the assignees
  const assignees = getTaskAssignees(task);
  
  // Get creator info
  const creator = getCreatorInfo(task.creator_id);
  
  // Get company name
  const companyName = getCompanyName(task.company_id);
  
  // Get related item name based on related_type
  const getRelatedItemName = () => {
    if (task.related_type === 'campaign' && task.campaign_id) {
      return getCampaignName(task.campaign_id);
    } else if (task.related_type === 'project' && task.project_id) {
      return getProjectName(task.project_id);
    }
    return null;
  };
  
  const relatedItemName = getRelatedItemName();
  
  // Truncate description to 30 characters (reduced from 40)
  const truncatedDescription = task.description && task.description.length > 30
    ? `${task.description.substring(0, 30)}...`
    : task.description;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow",
        task.status === 'completed' ? "bg-green-50" : 
        isOverdue ? "bg-red-50" : "bg-background"
      )}
      onClick={(e) => {
        // Only trigger onClick if we're not dragging
        if (!isDragging) {
          onClick();
        }
      }}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-start">
            <h4 className={cn(
              "font-medium text-xs",
              task.status === 'completed' ? "text-green-800" : 
              isOverdue ? "text-red-800" : ""
            )}>
              {task.title}
            </h4>
            <div className="flex items-center gap-1">
              {/* Client visibility indicator */}
              {task.client_visible ? (
                <Eye className="h-3 w-3 text-blue-500" />
              ) : (
                <EyeOff className="h-3 w-3 text-gray-400" />
              )}
              {getPriorityBadge(task.priority)}
            </div>
          </div>
          
          {truncatedDescription && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {truncatedDescription}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-1 gap-1">
            {/* Due date and Company name next to each other */}
            <div className="flex flex-wrap items-center gap-1 text-xs">
              {task.due_date && (
                <div className={cn(
                  "flex items-center gap-1",
                  isOverdue ? "text-red-700" : "text-muted-foreground"
                )}>
                  {isOverdue ? (
                    <AlertCircle className="h-3 w-3" />
                  ) : (
                    <Calendar className="h-3 w-3" />
                  )}
                  <span>{new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              )}
              
              {companyName && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building className="h-3 w-3" />
                  <span className="truncate max-w-[100px]">{companyName}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Related item (campaign or project) */}
          {relatedItemName && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link className="h-3 w-3" />
              <span className="truncate max-w-[160px]">
                {task.related_type === 'campaign' ? 'Campaign: ' : 'Project: '}
                {relatedItemName}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-3 pt-0 flex justify-between items-center">
        {/* Assignees */}
        <UserAvatarGroup 
          users={assignees}
          size="sm"
        />
        
        {/* Creator avatar */}
        {creator && (
          <Avatar className="h-5 w-5" title={`Created by: ${creator.first_name || ''} ${creator.last_name || ''}`}>
            {creator.avatar_url ? (
              <AvatarImage src={creator.avatar_url} />
            ) : (
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {getInitials(creator)}
              </AvatarFallback>
            )}
          </Avatar>
        )}
      </CardFooter>
    </Card>
  );
};

// Helper function to conditionally join classNames
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// Helper function to get initials from name
function getInitials(user: Contact): string {
  return `${(user.first_name?.[0] || '').toUpperCase()}${(user.last_name?.[0] || '').toUpperCase()}` || '?';
}
