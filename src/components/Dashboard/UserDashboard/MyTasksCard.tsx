
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

      // Get tasks assigned to the current user
      const { data: tasks, error } = await supabase
        .from('task_assignees')
        .select(`
          task_id,
          tasks:task_id (
            id,
            status,
            due_date
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const userTasks = tasks?.map(t => t.tasks).filter(Boolean) || [];
      const active = userTasks.filter(task => 
        task.status === 'todo' || task.status === 'in-progress'
      ).length;
      
      const now = new Date();
      const overdue = userTasks.filter(task => 
        (task.status === 'todo' || task.status === 'in-progress') &&
        task.due_date && 
        new Date(task.due_date) < now
      ).length;

      return { active, overdue };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
            <CheckCircle className="h-5 w-5" />
            My Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground animate-pulse">
            <div className="h-12 bg-blue-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-blue-200 rounded mb-2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = taskStats || { active: 0, overdue: 0 };

  return (
    <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
          <CheckCircle className="h-5 w-5" />
          My Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hero Section */}
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-1">{stats.active}</div>
          <div className="text-sm text-blue-600/70 font-medium">Active Tasks</div>
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
        <div className="flex items-center justify-center gap-2 text-sm text-blue-600/70">
          <Activity className="h-4 w-4" />
          <span>
            {stats.active === 0 ? 'All caught up!' : 'Keep it up!'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
