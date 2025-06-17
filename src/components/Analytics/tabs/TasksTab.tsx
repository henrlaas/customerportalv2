
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import { ThemedMetricCard } from '../ThemedMetricCard';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckSquare } from 'lucide-react';

export const TasksTab = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.getAnalyticsData,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-orange-50/50 p-4 rounded-lg">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const completionRate = analytics.totalTasks > 0 ? 
    Math.round((analytics.completedTasks / analytics.totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <CheckSquare className="h-6 w-6 text-orange-600" />
        <h2 className="text-2xl font-bold text-orange-700">Tasks Overview</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ThemedMetricCard 
          title="Total Tasks" 
          value={analytics.totalTasks}
          icon={CheckSquare}
          theme="orange"
          description="All tasks"
        />
        <ThemedMetricCard 
          title="Uncompleted" 
          value={analytics.uncompletedTasks}
          icon={CheckSquare}
          theme="orange"
          description="Pending tasks"
        />
        <ThemedMetricCard 
          title="Completed" 
          value={analytics.completedTasks}
          icon={CheckSquare}
          theme="orange"
          description={`${completionRate}% completion rate`}
        />
        <ThemedMetricCard 
          title="Overdue" 
          value={analytics.overdueTasks}
          icon={CheckSquare}
          theme="orange"
          description="Need immediate attention"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white/70 p-6 rounded-lg border border-orange-200">
          <h3 className="text-lg font-semibold text-orange-700 mb-4">Task Completion Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-orange-600">Completed Tasks</span>
                <span className="text-orange-700 font-semibold">{completionRate}%</span>
              </div>
              <div className="w-full bg-orange-100 rounded-full h-3">
                <div 
                  className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <div className="text-sm text-orange-600 mt-1">
                {analytics.completedTasks} of {analytics.totalTasks} tasks completed
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 p-6 rounded-lg border border-orange-200">
          <h3 className="text-lg font-semibold text-orange-700 mb-4">Task Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-orange-600">On Track</span>
              <div className="text-2xl font-bold text-orange-700">
                {analytics.totalTasks - analytics.overdueTasks}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-orange-600">Overdue Rate</span>
              <div className="text-lg font-semibold text-orange-700">
                {analytics.totalTasks > 0 ? Math.round((analytics.overdueTasks / analytics.totalTasks) * 100) : 0}%
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-orange-600">Productivity Score</span>
              <div className="text-lg font-semibold text-orange-700">
                {Math.max(0, 100 - (analytics.totalTasks > 0 ? Math.round((analytics.overdueTasks / analytics.totalTasks) * 100) : 0))}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
