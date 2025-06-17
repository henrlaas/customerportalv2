
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analyticsService';
import { ThemedMetricCard } from '../ThemedMetricCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { 
  BarChart3, 
  Building2, 
  FolderOpen, 
  CheckSquare,
  Megaphone,
  TrendingUp,
  Users,
  HardDrive
} from 'lucide-react';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4', '#EF4444'];

export const OverviewTab = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.getAnalyticsData,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-blue-50/50">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const overviewData = [
    { name: 'Companies', value: analytics.totalCompanies, color: '#10B981' },
    { name: 'Projects', value: analytics.totalProjects, color: '#8B5CF6' },
    { name: 'Tasks', value: analytics.totalTasks, color: '#F59E0B' },
    { name: 'Campaigns', value: analytics.totalCampaigns, color: '#06B6D4' },
    { name: 'Deals', value: analytics.totalDeals, color: '#EF4444' },
    { name: 'Users', value: analytics.totalUsers, color: '#6366F1' }
  ];

  const completionData = [
    { name: 'Completed Projects', value: analytics.completedProjects, total: analytics.totalProjects },
    { name: 'Completed Tasks', value: analytics.completedTasks, total: analytics.totalTasks },
    { name: 'Signed Contracts', value: analytics.signedContracts, total: analytics.totalContracts }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-blue-700">Analytics Overview</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ThemedMetricCard 
          title="Total Companies" 
          value={analytics.totalCompanies}
          icon={Building2}
          theme="blue"
          description="Active client companies"
        />
        <ThemedMetricCard 
          title="Active Projects" 
          value={analytics.inProgressProjects}
          icon={FolderOpen}
          theme="blue"
          description={`${analytics.totalProjects} total projects`}
        />
        <ThemedMetricCard 
          title="Pending Tasks" 
          value={analytics.uncompletedTasks}
          icon={CheckSquare}
          theme="blue"
          description={`${analytics.totalTasks} total tasks`}
        />
        <ThemedMetricCard 
          title="Total MRR" 
          value={`kr ${analytics.totalMrr.toLocaleString()}`}
          icon={TrendingUp}
          theme="blue"
          description="Monthly recurring revenue"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/70 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">Workspace Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overviewData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {overviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700">Completion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionData}>
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ThemedMetricCard 
          title="Total Campaigns" 
          value={analytics.totalCampaigns}
          icon={Megaphone}
          theme="blue"
          description="Marketing campaigns"
        />
        <ThemedMetricCard 
          title="Team Members" 
          value={analytics.adminUsers + analytics.employeeUsers}
          icon={Users}
          theme="blue"
          description={`${analytics.clientUsers} client users`}
        />
        <ThemedMetricCard 
          title="Files Stored" 
          value={analytics.totalFiles}
          icon={HardDrive}
          theme="blue"
          description="Media files"
        />
        <ThemedMetricCard 
          title="Project Value" 
          value={`kr ${Math.round(analytics.totalProjectsValue).toLocaleString()}`}
          icon={TrendingUp}
          theme="blue"
          description="Total project portfolio"
        />
      </div>
    </div>
  );
};
