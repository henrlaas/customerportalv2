
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckSquare, Clock, AlertTriangle } from 'lucide-react';

export const MyTasksCard = () => {
  const { user } = useAuth();

  const { data: taskStats, isLoading } = useQuery({
    queryKey: ['user-task-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, notCompleted: 0, overdue: 0 };

      // Get tasks assigned to the current user
      const { data: userTasks, error } = await supabase
        .from('task_assignees')
        .select(`
          task_id,
          tasks (
            id,
            status,
            due_date
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const tasks = userTasks?.map(ta => ta.tasks).filter(Boolean) || [];
      const total = tasks.length;
      const notCompleted = tasks.filter(t => t.status !== 'completed').length;
      
      // Calculate overdue tasks
      const now = new Date();
      const overdue = tasks.filter(t => 
        t.status !== 'completed' && 
        t.due_date && 
        new Date(t.due_date) < now
      ).length;

      return { total, notCompleted, overdue };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            My Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          My Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Tasks</span>
            <span className="text-2xl font-bold">{taskStats?.total || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Not Completed</span>
            </div>
            <span className="text-lg font-semibold text-blue-600">{taskStats?.notCompleted || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm">Overdue</span>
            </div>
            <span className="text-lg font-semibold text-red-600">{taskStats?.overdue || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
