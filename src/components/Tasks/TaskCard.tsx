
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  assignees?: { id: string; user_id: string }[];
}

interface TaskCardProps {
  task: Task;
  getStatusBadge: (status: string) => React.ReactNode;
  getPriorityBadge: (priority: string) => React.ReactNode;
  getTaskAssignees: (task: Task) => any[];
  onClick: () => void;
  isDragging: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  getStatusBadge,
  getPriorityBadge,
  getTaskAssignees,
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
            <h4 className={cn(
              "font-medium text-sm",
              task.status === 'completed' ? "text-green-800" : 
              isOverdue ? "text-red-800" : ""
            )}>
              {task.title}
            </h4>
            {getPriorityBadge(task.priority)}
          </div>
          
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
          
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
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <UserAvatarGroup 
          users={assignees}
          size="sm"
        />
      </CardFooter>
    </Card>
  );
};

// Helper function to conditionally join classNames
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
