
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, AlertTriangle, Calendar } from 'lucide-react';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';

interface RecentTasksListProps {
  tasks: any[];
  onTaskClick: (taskId: string) => void;
  onCreateTask: () => void;
}

export const RecentTasksList: React.FC<RecentTasksListProps> = ({
  tasks,
  onTaskClick,
  onCreateTask
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">To Do</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get the 3 most urgent tasks (prioritizing overdue, then due soon, then by priority)
  const urgentTasks = tasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => {
      // First sort by overdue status
      const aOverdue = isOverdue(a.due_date);
      const bOverdue = isOverdue(b.due_date);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      // Then by due date
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;
      
      // Finally by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) - 
             (priorityOrder[b.priority as keyof typeof priorityOrder] || 3);
    })
    .slice(0, 3);

  if (urgentTasks.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 mb-4">No active tasks in this project.</p>
        <Button onClick={onCreateTask} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {urgentTasks.map(task => (
        <div
          key={task.id}
          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => onTaskClick(task.id)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{task.title}</h4>
                {isOverdue(task.due_date) && (
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge(task.status)}
                {getPriorityBadge(task.priority)}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span className={isOverdue(task.due_date) ? 'text-red-600 font-medium' : ''}>
                    {formatDate(task.due_date)}
                  </span>
                </div>
                
                {task.assignees && task.assignees.length > 0 && (
                  <UserAvatarGroup
                    users={task.assignees.map((assignee: any) => ({
                      id: assignee.user_id,
                      first_name: assignee.profiles?.first_name,
                      last_name: assignee.profiles?.last_name,
                      avatar_url: assignee.profiles?.avatar_url
                    }))}
                    size="xs"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="pt-2 border-t">
        <Button variant="outline" size="sm" onClick={onCreateTask} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create New Task
        </Button>
      </div>
    </div>
  );
};
