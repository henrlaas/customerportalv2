
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';

export function MyTasksCard() {
  const { user } = useAuth();

  const { data: taskStats, isLoading } = useQuery({
    queryKey: ['my-task-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, notCompleted: 0, overdue: 0 };

      // Get tasks assigned to the current user
      const { data: assignedTasks, error } = await supabase
        .from('task_assignees')
        .select(`
          task_id,
          tasks!inner(
            id,
            status,
            due_date
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const total = assignedTasks?.length || 0;
      const notCompleted = assignedTasks?.filter(ta => 
        ta.tasks.status !== 'completed'
      ).length || 0;
      
      const today = new Date();
      const overdue = assignedTasks?.filter(ta => 
        ta.tasks.status !== 'completed' && 
        ta.tasks.due_date && 
        new Date(ta.tasks.due_date) < today
      ).length || 0;

      return { total, notCompleted, overdue };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-blue-600" />
          My Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Total Tasks</span>
          </div>
          <span className="font-semibold text-lg">{taskStats?.total || 0}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-600">Not Completed</span>
          </div>
          <span className="font-semibold text-lg text-orange-600">{taskStats?.notCompleted || 0}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-gray-600">Overdue</span>
          </div>
          <span className="font-semibold text-lg text-red-600">{taskStats?.overdue || 0}</span>
        </div>
      </CardContent>
    </Card>
  );
}
