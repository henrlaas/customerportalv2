
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
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
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm">{task.title}</h4>
            {getPriorityBadge(task.priority)}
          </div>
          
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
          
          {task.due_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <UserAvatarGroup 
          users={getTaskAssignees(task)}
          size="sm"
        />
      </CardFooter>
    </Card>
  );
};
