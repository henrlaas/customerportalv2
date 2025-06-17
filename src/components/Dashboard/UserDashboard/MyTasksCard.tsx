
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const MyTasksCard = () => {
  const { user } = useAuth();

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['my-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, incomplete: 0, overdue: 0 };

      // Get user's assigned tasks
      const { data: assignedTasks, error } = await supabase
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

      const tasks = assignedTasks?.map(ta => ta.tasks).filter(Boolean) || [];
      const total = tasks.length;
      const incomplete = tasks.filter(t => t.status !== 'completed').length;
      
      // Calculate overdue tasks
      const now = new Date();
      const overdue = tasks.filter(t => 
        t.status !== 'completed' && 
        t.due_date && 
        new Date(t.due_date) < now
      ).length;

      return { total, incomplete, overdue };
    },
    enabled: !!user?.id,
  });

  const stats = tasksData || { total: 0, incomplete: 0, overdue: 0 };

  return (
    <Card className="bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-blue-600" />
          My Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? '...' : stats.total}
            </div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {isLoading ? '...' : stats.incomplete}
            </div>
            <div className="text-xs text-gray-500">Incomplete</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? '...' : stats.overdue}
            </div>
            <div className="text-xs text-gray-500">Overdue</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
