
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Activity } from 'lucide-react';

export const MyTasksCard = () => {
  const { user } = useAuth();

  const { data: taskStats, isLoading } = useQuery({
    queryKey: ['user-task-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { active: 0, overdue: 0 };

      console.log('Fetching tasks for user:', user.id);

      // Get tasks assigned to the current user - using tasks table as primary
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          id,
          status,
          due_date,
          title,
          task_assignees!inner (
            user_id
          )
        `)
        .eq('task_assignees.user_id', user.id);

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      console.log('Raw task data:', tasks);

      const userTasks = tasks || [];
      console.log('User tasks:', userTasks);
      
      // Count active tasks (both todo and in-progress) - ALL tasks regardless of due date
      const activeTasks = userTasks.filter(task => 
        task.status === 'todo' || task.status === 'in-progress'
      );
      const active = activeTasks.length;
      
      console.log('Active tasks count:', active);
      console.log('Active tasks:', activeTasks);
      
      // Count overdue tasks - only from active tasks that have a due date in the past
      const now = new Date();
      const overdueTasks = activeTasks.filter(task => 
        task.due_date && 
        new Date(task.due_date) < now
      );
      const overdue = overdueTasks.length;

      console.log('Overdue tasks count:', overdue);
      console.log('Overdue tasks:', overdueTasks);

      return { active, overdue };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            My Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground animate-pulse">
            <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = taskStats || { active: 0, overdue: 0 };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 bg-white border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          My Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hero Section */}
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-1">{stats.active}</div>
          <div className="text-sm text-muted-foreground font-medium">Active Tasks</div>
        </div>

        {/* Overdue Warning */}
        {stats.overdue > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">
                {stats.overdue} task{stats.overdue === 1 ? '' : 's'} overdue
              </span>
            </div>
          </div>
        )}

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span>
            {stats.active === 0 ? 'All caught up!' : 'Keep it up!'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
