
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import { ThemedMetricCard } from '../ThemedMetricCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

export const UsersTab = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.getAnalyticsData,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-indigo-50/50 p-4 rounded-lg">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6 text-indigo-600" />
        <h2 className="text-2xl font-bold text-indigo-700">Users & Access</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ThemedMetricCard 
          title="Total Users" 
          value={analytics.totalUsers}
          icon={Users}
          theme="indigo"
          description="All platform users"
        />
        <ThemedMetricCard 
          title="Client Users" 
          value={analytics.clientUsers}
          icon={Users}
          theme="indigo"
          description="Client access users"
        />
        <ThemedMetricCard 
          title="Admin Users" 
          value={analytics.adminUsers}
          icon={Users}
          theme="indigo"
          description="Administrator access"
        />
        <ThemedMetricCard 
          title="Employee Users" 
          value={analytics.employeeUsers}
          icon={Users}
          theme="indigo"
          description="Team members"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white/70 p-6 rounded-lg border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-700 mb-4">User Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-indigo-600">Clients</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-indigo-100 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analytics.totalUsers > 0 ? (analytics.clientUsers / analytics.totalUsers) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm text-indigo-700 font-medium">
                  {analytics.totalUsers > 0 ? Math.round((analytics.clientUsers / analytics.totalUsers) * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-indigo-600">Team Members</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-indigo-100 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analytics.totalUsers > 0 ? ((analytics.adminUsers + analytics.employeeUsers) / analytics.totalUsers) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm text-indigo-700 font-medium">
                  {analytics.totalUsers > 0 ? Math.round(((analytics.adminUsers + analytics.employeeUsers) / analytics.totalUsers) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 p-6 rounded-lg border border-indigo-200">
          <h3 className="text-lg font-semibold text-indigo-700 mb-4">Access Levels</h3>
          <div className="space-y-3">
            <div>
              <span className="text-indigo-600 text-sm">Administrative Access</span>
              <div className="text-2xl font-bold text-indigo-700">
                {analytics.adminUsers}
              </div>
            </div>
            <div>
              <span className="text-indigo-600 text-sm">Total Internal Users</span>
              <div className="text-xl font-semibold text-indigo-700">
                {analytics.adminUsers + analytics.employeeUsers}
              </div>
            </div>
            <div>
              <span className="text-indigo-600 text-sm">Client to Team Ratio</span>
              <div className="text-lg font-semibold text-indigo-700">
                {(analytics.adminUsers + analytics.employeeUsers) > 0 ? 
                  Math.round((analytics.clientUsers / (analytics.adminUsers + analytics.employeeUsers)) * 10) / 10 : 0}:1
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
