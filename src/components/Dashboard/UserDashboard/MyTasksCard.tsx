
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Activity } from 'lucide-react';

export const MyTasksCard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: taskStats, isLoading, error } = useQuery({
    queryKey: ['user-task-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { active: 0, overdue: 0 };

      console.log('Dashboard: Fetching tasks for user:', user.id);

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
        console.error('Dashboard: Error fetching tasks:', error);
        throw error;
      }

      const userTasks = tasks || [];
      console.log('Dashboard: Total tasks fetched:', userTasks.length);
      console.log('Dashboard: Task statuses breakdown:', 
        userTasks.reduce((acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      );
      
      // Count active tasks - exclude completed (like Calendar does)
      const activeTasks = userTasks.filter(task => 
        task.status !== 'completed'
      );
      const active = activeTasks.length;
      
      console.log('Dashboard: Active tasks (non-completed):', active);
      console.log('Dashboard: Active task IDs:', activeTasks.map(t => t.id));
      
      // Count overdue tasks - only from active tasks that have a due date in the past
      const now = new Date();
      const overdueTasks = activeTasks.filter(task => 
        task.due_date && 
        new Date(task.due_date) < now
      );
      const overdue = overdueTasks.length;

      console.log('Dashboard: Overdue tasks:', overdue);
      console.log('Dashboard: Overdue task details:', 
        overdueTasks.map(t => ({ id: t.id, title: t.title, due_date: t.due_date, status: t.status }))
      );

      return { active, overdue };
    },
    enabled: !!user?.id,
    staleTime: 0, // Don't use stale data, always fetch fresh
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Subscribe to real-time updates for tasks
  React.useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('task-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          console.log('Dashboard: Task update detected, invalidating cache');
          // Invalidate and refetch the task stats when any task changes
          queryClient.invalidateQueries({ queryKey: ['user-task-stats', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_assignees'
        },
        () => {
          console.log('Dashboard: Task assignment update detected, invalidating cache');
          // Invalidate and refetch when task assignments change
          queryClient.invalidateQueries({ queryKey: ['user-task-stats', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  if (error) {
    console.error('Task stats query error:', error);
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            My Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            Error loading tasks. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

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
    <Card className="h-full hover:shadow-lg transition-all duration-200">
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
