
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
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
            <CheckCircle className="h-5 w-5 text-[#004743]" />
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
      <Card className="h-full border-l-4 border-l-[#004743]">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-[#004743]" />
            My Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="bg-gray-200 h-16 rounded-lg"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-200 h-12 rounded-lg"></div>
              <div className="bg-gray-200 h-12 rounded-lg"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = taskStats || { active: 0, overdue: 0, completed: 0 };
  const totalTasks = stats.active + stats.completed;
  const completionRate = totalTasks > 0 ? Math.round((stats.completed / totalTasks) * 100) : 0;
  const isOnTrack = stats.overdue === 0;

  return (
    <Card className="h-full border-l-4 border-l-[#004743] bg-gradient-to-br from-white via-white to-[#F2FCE2]/20 hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-[#004743]">
            <CheckCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
            My Tasks
          </CardTitle>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isOnTrack 
              ? 'bg-[#F2FCE2] text-[#004743]' 
              : 'bg-red-50 text-red-600'
          }`}>
            {isOnTrack ? 'On Track' : 'Needs Attention'}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        {/* Hero Section with Progress Ring */}
        <div className="relative">
          <div className="text-center">
            <div className="text-4xl font-bold text-[#004743] mb-2">{stats.active}</div>
            <div className="text-sm text-gray-600 font-medium mb-3">Active Tasks</div>
            
            {/* Completion Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-[#004743] to-[#004743]/80 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">
              {completionRate}% completion rate
            </div>
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F2FCE2]/30 rounded-lg p-3 text-center border border-[#F2FCE2]/50 hover:bg-[#F2FCE2]/40 transition-colors">
            <div className="flex items-center justify-center mb-1">
              <CheckCircle className="h-4 w-4 text-[#004743] mr-1" />
              <span className="text-lg font-bold text-[#004743]">{stats.completed}</span>
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          
          <div className={`rounded-lg p-3 text-center border transition-colors ${
            stats.overdue > 0 
              ? 'bg-red-50 border-red-200 hover:bg-red-100' 
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}>
            <div className="flex items-center justify-center mb-1">
              <AlertTriangle className={`h-4 w-4 mr-1 ${
                stats.overdue > 0 ? 'text-red-600' : 'text-gray-400'
              }`} />
              <span className={`text-lg font-bold ${
                stats.overdue > 0 ? 'text-red-600' : 'text-gray-400'
              }`}>{stats.overdue}</span>
            </div>
            <div className="text-xs text-gray-600">Overdue</div>
          </div>
        </div>

        {/* Status Footer */}
        <div className="flex items-center justify-center pt-2 border-t border-gray-100">
          {stats.overdue > 0 ? (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Review overdue tasks</span>
            </div>
          ) : stats.active === 0 ? (
            <div className="flex items-center gap-2 text-sm text-[#004743]">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">All caught up! 🎉</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-[#004743]">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Keep up the great work!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
