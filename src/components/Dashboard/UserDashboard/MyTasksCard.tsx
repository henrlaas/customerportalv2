
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, Target } from 'lucide-react';

export const MyTasksCard = () => {
  const { user } = useAuth();

  const { data: taskStats, isLoading } = useQuery({
    queryKey: ['user-task-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, notCompleted: 0, overdue: 0, completed: 0 };

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
      const completed = userTasks.filter(task => task.status === 'completed').length;
      const notCompleted = userTasks.filter(task => 
        task.status === 'todo' || task.status === 'in-progress'
      ).length;
      
      const now = new Date();
      const overdue = userTasks.filter(task => 
        (task.status === 'todo' || task.status === 'in-progress') &&
        task.due_date && 
        new Date(task.due_date) < now
      ).length;

      return { total, notCompleted, overdue, completed };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            My Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded w-24"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = taskStats || { total: 0, notCompleted: 0, overdue: 0, completed: 0 };
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            My Tasks
          </div>
          {stats.overdue > 0 && (
            <Badge variant="destructive" className="text-xs">
              {stats.overdue} overdue
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hero Metric */}
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-1">
            {stats.notCompleted}
          </div>
          <div className="text-sm text-muted-foreground">Active Tasks</div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Supporting Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Total</span>
            </div>
            <div className="text-lg font-bold text-blue-700">{stats.total}</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Done</span>
            </div>
            <div className="text-lg font-bold text-green-700">{stats.completed}</div>
          </div>
        </div>

        {/* Status Insights */}
        <div className="space-y-2 pt-1">
          {stats.notCompleted > 0 && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <Clock className="h-3 w-3" />
              <span>{stats.notCompleted} tasks in progress</span>
            </div>
          )}
          {stats.overdue > 0 && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle className="h-3 w-3" />
              <span>{stats.overdue} tasks overdue</span>
            </div>
          )}
          {stats.notCompleted === 0 && stats.total > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>All tasks completed! 🎉</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
