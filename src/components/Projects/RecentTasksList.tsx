
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
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
  // Show only the 5 most recent tasks
  const recentTasks = tasks.slice(0, 5);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'todo':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  console.log('RecentTasksList received tasks:', tasks);

  if (recentTasks.length === 0) {
    return (
      <div className="text-center py-6">
        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 mb-4">No recent tasks</p>
        <Button onClick={onCreateTask} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create First Task
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentTasks.map((task) => {
        console.log('Rendering task:', task);
        console.log('Task assignees in RecentTasksList:', task.assignees);
        
        return (
          <Card 
            key={task.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onTaskClick(task.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(task.status)}
                    <h4 className="font-medium text-sm truncate">{task.title}</h4>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{formatDate(task.created_at)}</span>
                    {getStatusBadge(task.status)}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  {task.assignees && task.assignees.length > 0 ? (
                    <UserAvatarGroup
                      users={task.assignees}
                      size="sm"
                      max={3}
                    />
                  ) : (
                    <div className="text-xs text-gray-400">No assignees</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {tasks.length > 5 && (
        <div className="text-center pt-2">
          <Button variant="ghost" size="sm">
            View All Tasks
          </Button>
        </div>
      )}
    </div>
  );
};
