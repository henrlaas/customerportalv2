
import { useQuery } from '@tanstack/react-query';
import { 
  Building2, 
  Users, 
  FolderOpen, 
  FileText, 
  CheckSquare,
  Target,
  Megaphone,
  TrendingUp,
  UserCheck,
  HardDrive,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { analyticsService, AnalyticsData } from '@/services/analyticsService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description,
  className = "" 
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  className?: string;
}) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0
  }).format(value);
};

const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const COLORS = ['#004743', '#5FA39D', '#F2FCE2', '#8B5CF6', '#06B6D4', '#84CC16'];

export const AnalyticsTab = () => {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.getAnalyticsData,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
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

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load analytics data</p>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-8">
      <div className="grid gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analytics Overview
        </h2>
        <p className="text-muted-foreground">
          Comprehensive analytics across all workspace data.
        </p>
      </div>

      {/* Companies & Clients */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Companies & Clients
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <MetricCard 
            title="Total Companies" 
            value={analytics.totalCompanies}
            icon={Building2}
          />
          <MetricCard 
            title="Marketing Clients" 
            value={analytics.marketingCompanies}
            icon={Megaphone}
          />
          <MetricCard 
            title="Web Clients" 
            value={analytics.webCompanies}
            icon={Target}
          />
          <MetricCard 
            title="Total MRR" 
            value={formatCurrency(analytics.totalMrr)}
            icon={TrendingUp}
          />
          <MetricCard 
            title="Company Contacts" 
            value={analytics.totalContacts}
            icon={Users}
          />
        </div>
      </div>

      {/* Projects */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Projects
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <MetricCard 
            title="Total Projects" 
            value={analytics.totalProjects}
            icon={FolderOpen}
          />
          <MetricCard 
            title="Total Value" 
            value={formatCurrency(analytics.totalProjectsValue)}
            icon={TrendingUp}
          />
          <MetricCard 
            title="In Progress" 
            value={analytics.inProgressProjects}
            icon={CheckSquare}
            className="border-blue-200"
          />
          <MetricCard 
            title="Completed" 
            value={analytics.completedProjects}
            icon={CheckSquare}
            className="border-green-200"
          />
          <MetricCard 
            title="Completed Value" 
            value={formatCurrency(analytics.completedProjectsValue)}
            icon={TrendingUp}
            className="border-green-200"
          />
          <MetricCard 
            title="Overdue" 
            value={analytics.overdueProjects}
            icon={CheckSquare}
            className="border-red-200"
          />
        </div>
      </div>

      {/* Contracts */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contracts
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard 
            title="Total Contracts" 
            value={analytics.totalContracts}
            icon={FileText}
          />
          <MetricCard 
            title="Signed" 
            value={analytics.signedContracts}
            icon={UserCheck}
            className="border-green-200"
          />
          <MetricCard 
            title="Unsigned" 
            value={analytics.unsignedContracts}
            icon={FileText}
            className="border-yellow-200"
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Tasks
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard 
            title="Total Tasks" 
            value={analytics.totalTasks}
            icon={CheckSquare}
          />
          <MetricCard 
            title="Uncompleted" 
            value={analytics.uncompletedTasks}
            icon={CheckSquare}
            className="border-blue-200"
          />
          <MetricCard 
            title="Completed" 
            value={analytics.completedTasks}
            icon={CheckSquare}
            className="border-green-200"
          />
          <MetricCard 
            title="Overdue" 
            value={analytics.overdueTasks}
            icon={CheckSquare}
            className="border-red-200"
          />
        </div>
      </div>

      {/* Campaigns & Advertising */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Campaigns & Advertising
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard 
            title="Total Campaigns" 
            value={analytics.totalCampaigns}
            icon={Megaphone}
          />
          <MetricCard 
            title="Total Adsets" 
            value={analytics.totalAdsets}
            icon={Target}
          />
          <MetricCard 
            title="Total Ads" 
            value={analytics.totalAds}
            icon={Target}
          />
        </div>
        
        {analytics.platformDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Platform Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.platformDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ platform, count }) => `${platform}: ${count}`}
                    >
                      {analytics.platformDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Deals */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Deals
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard 
            title="Total Deals" 
            value={analytics.totalDeals}
            icon={TrendingUp}
          />
          <MetricCard 
            title="Total Value" 
            value={formatCurrency(analytics.totalDealsValue)}
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Users */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Users className="h-5 w-5" />
          Users & Access
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard 
            title="Total Users" 
            value={analytics.totalUsers}
            icon={Users}
          />
          <MetricCard 
            title="Client Users" 
            value={analytics.clientUsers}
            icon={Users}
            className="border-blue-200"
          />
          <MetricCard 
            title="Admin Users" 
            value={analytics.adminUsers}
            icon={Users}
            className="border-red-200"
          />
          <MetricCard 
            title="Employee Users" 
            value={analytics.employeeUsers}
            icon={Users}
            className="border-green-200"
          />
        </div>
      </div>

      {/* Files & Storage */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Files & Storage
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard 
            title="Total Files" 
            value={analytics.totalFiles}
            icon={HardDrive}
          />
          <MetricCard 
            title="Total Storage Used" 
            value={formatFileSize(analytics.totalFileSize)}
            icon={HardDrive}
          />
        </div>
      </div>
    </div>
  );
};
