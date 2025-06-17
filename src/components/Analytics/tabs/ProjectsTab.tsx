
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import { ThemedMetricCard } from '../ThemedMetricCard';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderOpen, TrendingUp, CheckSquare } from 'lucide-react';

export const ProjectsTab = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.getAnalyticsData,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-purple-50/50 p-4 rounded-lg">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0
    }).format(value);
  };

  const completionRate = analytics.totalProjects > 0 ? 
    Math.round((analytics.completedProjects / analytics.totalProjects) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <FolderOpen className="h-6 w-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-purple-700">Projects Overview</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <ThemedMetricCard 
          title="Total Projects" 
          value={analytics.totalProjects}
          icon={FolderOpen}
          theme="purple"
          description="All projects"
        />
        <ThemedMetricCard 
          title="Total Value" 
          value={formatCurrency(analytics.totalProjectsValue)}
          icon={TrendingUp}
          theme="purple"
          description="Portfolio value"
        />
        <ThemedMetricCard 
          title="In Progress" 
          value={analytics.inProgressProjects}
          icon={CheckSquare}
          theme="purple"
          description="Active projects"
        />
        <ThemedMetricCard 
          title="Completed" 
          value={analytics.completedProjects}
          icon={CheckSquare}
          theme="purple"
          description={`${completionRate}% completion rate`}
        />
        <ThemedMetricCard 
          title="Completed Value" 
          value={formatCurrency(analytics.completedProjectsValue)}
          icon={TrendingUp}
          theme="purple"
          description="Delivered value"
        />
        <ThemedMetricCard 
          title="Overdue" 
          value={analytics.overdueProjects}
          icon={CheckSquare}
          theme="purple"
          description="Needs attention"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white/70 p-6 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-700 mb-4">Project Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-purple-600">Completed</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-purple-100 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <span className="text-sm text-purple-700 font-medium">{completionRate}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-600">In Progress</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-purple-100 rounded-full h-2">
                  <div 
                    className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analytics.totalProjects > 0 ? (analytics.inProgressProjects / analytics.totalProjects) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm text-purple-700 font-medium">
                  {analytics.totalProjects > 0 ? Math.round((analytics.inProgressProjects / analytics.totalProjects) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 p-6 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-700 mb-4">Value Metrics</h3>
          <div className="space-y-3">
            <div>
              <span className="text-purple-600 text-sm">Average Project Value</span>
              <div className="text-2xl font-bold text-purple-700">
                {analytics.totalProjects > 0 ? formatCurrency(analytics.totalProjectsValue / analytics.totalProjects) : formatCurrency(0)}
              </div>
            </div>
            <div>
              <span className="text-purple-600 text-sm">Value Completion Rate</span>
              <div className="text-xl font-semibold text-purple-700">
                {analytics.totalProjectsValue > 0 ? Math.round((analytics.completedProjectsValue / analytics.totalProjectsValue) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 p-6 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-700 mb-4">Performance</h3>
          <div className="space-y-3">
            <div>
              <span className="text-purple-600 text-sm">On Time Projects</span>
              <div className="text-2xl font-bold text-purple-700">
                {analytics.totalProjects > 0 ? analytics.totalProjects - analytics.overdueProjects : 0}
              </div>
            </div>
            <div>
              <span className="text-purple-600 text-sm">On Time Rate</span>
              <div className="text-xl font-semibold text-purple-700">
                {analytics.totalProjects > 0 ? Math.round(((analytics.totalProjects - analytics.overdueProjects) / analytics.totalProjects) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
