
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { useRealtimeTasks } from '@/hooks/realtime/useRealtimeTasks';

export const MyTasksCard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Enable real-time updates for tasks
  useRealtimeTasks({ enabled: !!user?.id });

  const { data: taskStats, isLoading, error } = useQuery({
    queryKey: ['user-task-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { active: 0, overdue: 0, completed: 0 };

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
      
      // Count active tasks - exclude completed
      const activeTasks = userTasks.filter(task => 
        task.status !== 'completed'
      );
      const active = activeTasks.length;
      
      // Count completed tasks
      const completedTasks = userTasks.filter(task => 
        task.status === 'completed'
      );
      const completed = completedTasks.length;
      
      // Count overdue tasks - only from active tasks that have a due date in the past
      const now = new Date();
      const overdueTasks = activeTasks.filter(task => 
        task.due_date && 
        new Date(task.due_date) < now
      );
      const overdue = overdueTasks.length;

      console.log('Dashboard: Task stats:', { active, completed, overdue });

      return { active, completed, overdue };
    },
    enabled: !!user?.id,
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 30 * 1000, // Refetch every 30 seconds as backup
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

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

  const stats = taskStats || { active: 0, overdue: 0, completed: 0 };

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

        {/* Task Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-green-50 rounded-lg p-3">
            <div className="text-xl font-semibold text-green-600">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center bg-red-50 rounded-lg p-3">
            <div className="text-xl font-semibold text-red-600">{stats.overdue}</div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </div>
        </div>

        {/* Status Indicator */}
        {stats.overdue > 0 ? (
          <div className="flex items-center justify-center gap-2 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Attention needed</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>
              {stats.active === 0 ? 'All caught up!' : 'Keep it up!'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
