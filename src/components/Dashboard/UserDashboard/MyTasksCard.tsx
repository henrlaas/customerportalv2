
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export const MyTasksCard = () => {
  const { user } = useAuth();

  const { data: taskStats, isLoading } = useQuery({
    queryKey: ['user-task-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, notCompleted: 0, overdue: 0 };

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
      const total = userTasks.length;
      const notCompleted = userTasks.filter(task => 
        task.status === 'todo' || task.status === 'in-progress'
      ).length;
      
      const now = new Date();
      const overdue = userTasks.filter(task => 
        (task.status === 'todo' || task.status === 'in-progress') &&
        task.due_date && 
        new Date(task.due_date) < now
      ).length;

      return { total, notCompleted, overdue };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            My Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const stats = taskStats || { total: 0, notCompleted: 0, overdue: 0 };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          My Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-500">{stats.notCompleted}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </div>
        </div>
        
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-orange-500" />
            <span>{stats.notCompleted} tasks in progress</span>
          </div>
          {stats.overdue > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>{stats.overdue} tasks overdue</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
