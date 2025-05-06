
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle, Eye, EyeOff, Briefcase, PackageOpen } from 'lucide-react';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  company_id: string | null;
  project_id: string | null;
  campaign_id: string | null;
  creator_id: string | null;
  client_visible: boolean | null;
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
  getStatusBadge: (status: string) => React.ReactNode;
  getPriorityBadge: (priority: string) => React.ReactNode;
  getTaskAssignees: (task: Task) => any[];
  getCreator: (creatorId: string | null) => Contact | null;
  getCompanyName: (companyId: string | null) => string | null;
  getCampaignName: (campaignId: string | null) => string | null;
  getProjectName: (projectId: string | null) => string | null;
  onClick: () => void;
  isDragging: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  getStatusBadge,
  getPriorityBadge,
  getTaskAssignees,
  getCreator,
  getCompanyName,
  getCampaignName,
  getProjectName,
  onClick,
  isDragging
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
  
  // Get creator details
  const creator = getCreator(task.creator_id);
  
  // Get initials for creator
  const getInitials = (user: Contact | null) => {
    if (!user) return '--';
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  // Get company name
  const companyName = getCompanyName(task.company_id);
  
  // Get related info (campaign or project)
  let relatedName = null;
  let relatedIcon = null;
  
  if (task.campaign_id) {
    relatedName = getCampaignName(task.campaign_id);
    relatedIcon = <PackageOpen className="h-3 w-3 mr-1" />;
  } else if (task.project_id) {
    relatedName = getProjectName(task.project_id);
    relatedIcon = <Briefcase className="h-3 w-3 mr-1" />;
  }

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
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2">
              {/* Client Visible Eye Icon */}
              <div className="mt-0.5">
                {task.client_visible ? 
                  <Eye className="h-3.5 w-3.5 text-gray-500" /> :
                  <EyeOff className="h-3.5 w-3.5 text-gray-500" />
                }
              </div>
              
              {/* Status Badge */}
              <div>
                {getStatusBadge(task.status)}
              </div>
            </div>
            
            {/* Priority Badge */}
            {getPriorityBadge(task.priority)}
          </div>
          
          <h4 className={cn(
            "font-medium text-sm mt-1",
            task.status === 'completed' ? "text-green-800" : 
            isOverdue ? "text-red-800" : ""
          )}>
            {task.title}
          </h4>
          
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
          
          {/* Due date section */}
          {task.due_date && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              isOverdue ? "text-red-700" : "text-muted-foreground"
            )}>
              {isOverdue ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
              {isOverdue && <span className="text-red-700 font-medium">Overdue</span>}
            </div>
          )}
          
          {/* Company info */}
          {companyName && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Briefcase className="h-3 w-3" />
              <span className="truncate">{companyName}</span>
            </div>
          )}
          
          {/* Related campaign/project info */}
          {relatedName && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {relatedIcon}
              <span className="truncate">{relatedName}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        {/* Assignees avatars */}
        <UserAvatarGroup 
          users={assignees}
          size="sm"
        />
        
        {/* Creator avatar */}
        {creator && (
          <Avatar 
            className="h-6 w-6 border-2 border-white" 
            title={`Created by ${creator.first_name || ''} ${creator.last_name || ''}`}
          >
            <AvatarImage src={creator.avatar_url || undefined} />
            <AvatarFallback className="text-xs bg-purple-100 text-purple-800">
              {getInitials(creator)}
            </AvatarFallback>
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
