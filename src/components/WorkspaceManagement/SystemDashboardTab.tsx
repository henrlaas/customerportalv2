
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { MessageSquare, Users, Clock, Activity, Monitor } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

const COLORS = ['#004743', '#5FA39D', '#F2FCE2', '#8B5CF6', '#06B6D4', '#84CC16'];

export const SystemDashboardTab: React.FC = () => {
  // Fetch notification statistics
  const { data: notificationStats, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['notification-statistics'],
    queryFn: async () => {
      const { data: totalCount, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      const { data: typeDistribution, error: typeError } = await supabase
        .from('notifications')
        .select('type, count')
        .select('type, count(*)')
        .group('type');

      if (typeError) throw typeError;

      const { data: weeklyData, error: weeklyError } = await supabase
        .from('notifications')
        .select('created_at, read')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (weeklyError) throw weeklyError;

      // Process weekly data into chart format
      const dailyStats = processWeeklyNotifications(weeklyData || []);

      return {
        totalCount: totalCount?.count || 0,
        typeDistribution: typeDistribution?.map(item => ({
          name: formatNotificationType(item.type),
          value: parseInt(item.count)
        })) || [],
        weeklyActivity: dailyStats
      };
    }
  });

  // Fetch user statistics
  const { data: userStats, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['user-statistics'],
    queryFn: async () => {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('role, count(*)')
        .group('role');

      if (error) throw error;

      let totalUsers = 0;
      const roleDistribution = users?.map(item => {
        totalUsers += parseInt(item.count);
        return {
          role: item.role,
          count: parseInt(item.count)
        };
      }) || [];

      return {
        totalUsers,
        roleDistribution
      };
    }
  });

  // Fetch cron job logs
  const { data: cronJobStats, isLoading: isLoadingCronJobs } = useQuery({
    queryKey: ['cron-job-statistics'],
    queryFn: async () => {
      const { data: logs, error } = await supabase
        .from('cron_job_logs')
        .select('job_name, status, execution_time')
        .order('execution_time', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Group by job name and status
      const jobStatus = logs?.reduce((acc, log) => {
        if (!acc[log.job_name]) {
          acc[log.job_name] = { success: 0, error: 0, total: 0 };
        }
        
        acc[log.job_name].total++;
        if (log.status === 'success') {
          acc[log.job_name].success++;
        } else if (log.status === 'error') {
          acc[log.job_name].error++;
        }
        
        return acc;
      }, {} as Record<string, {success: number, error: number, total: number}>);

      // Process job execution times
      const jobTimings = processJobTimings(logs || []);

      return {
        jobStatus: Object.entries(jobStatus).map(([name, stats]) => ({
          name,
          successRate: (stats.success / stats.total) * 100,
          errorRate: (stats.error / stats.total) * 100,
          totalRuns: stats.total
        })),
        recentJobs: logs?.slice(0, 5) || [],
        jobTimings
      };
    }
  });

  // Helper function to process job timings
  const processJobTimings = (logs: any[]) => {
    // Group logs by day
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(day => {
      const dayLogs = logs.filter(log => log.execution_time.startsWith(day));
      return {
        date: day,
        jobs: dayLogs.length,
        successRate: dayLogs.filter(log => log.status === 'success').length / Math.max(dayLogs.length, 1) * 100
      };
    });
  };

  // Helper function to process weekly notification data
  const processWeeklyNotifications = (notifications: any[]) => {
    // Group notifications by day
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();
    
    return last7Days.map(day => {
      const dayNotifications = notifications.filter(n => n.created_at.startsWith(day));
      return {
        name: day.split('-')[2], // Just show the day
        sent: dayNotifications.length,
        opened: dayNotifications.filter(n => n.read).length
      };
    });
  };

  // Helper function to format notification types
  const formatNotificationType = (type: string): string => {
    if (!type) return "Unknown";
    
    // Replace underscores with spaces and capitalize words
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const isLoading = isLoadingNotifications || isLoadingUsers || isLoadingCronJobs;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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

  return (
    <div className="space-y-8">
      <div className="grid gap-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          System Overview
        </h2>
        <p className="text-muted-foreground">
          Monitor system usage, notification performance, and user activity.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationStats?.totalCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all users and notification types
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {userStats?.roleDistribution?.find(r => r.role === 'admin')?.count || 0} admins, {userStats?.roleDistribution?.find(r => r.role === 'employee')?.count || 0} employees
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cronJobStats?.jobStatus?.length ? 
                Math.round(
                  cronJobStats.jobStatus.reduce((acc, job) => acc + job.successRate, 0) / 
                  cronJobStats.jobStatus.length
                ) + '%' : 
                'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {cronJobStats?.jobStatus?.length ? 
                  cronJobStats.jobStatus.reduce((acc, job) => acc + job.totalRuns, 0) : 0} total runs
              </Badge>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Job Run</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {cronJobStats?.recentJobs?.[0]?.job_name || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {cronJobStats?.recentJobs?.[0] ? 
                new Date(cronJobStats.recentJobs[0].execution_time).toLocaleString() : 'No recent jobs'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Activity</CardTitle>
            <p className="text-sm text-muted-foreground">
              Last 7 days notification activity
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={notificationStats?.weeklyActivity || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sent" fill="#8884d8" name="Total" />
                <Bar dataKey="opened" fill="#82ca9d" name="Read" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribution of notification types
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={notificationStats?.typeDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {notificationStats?.typeDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Job Performance</CardTitle>
            <p className="text-sm text-muted-foreground">
              Cron job execution success rate over time
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cronJobStats?.jobTimings || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="jobs" stroke="#8884d8" name="Total Jobs" />
                <Line type="monotone" dataKey="successRate" stroke="#82ca9d" name="Success Rate %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <p className="text-sm text-muted-foreground">
              Key performance indicators and system health
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {cronJobStats?.jobStatus?.map((job, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">{job.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs">{job.totalRuns} runs</span>
                  <Badge 
                    variant={job.successRate > 90 ? "success" : job.successRate > 70 ? "outline" : "destructive"}
                    className={`text-xs ${job.successRate > 90 ? 'bg-green-100 text-green-800' : 
                      job.successRate > 70 ? '' : 'bg-red-100 text-red-800'}`}
                  >
                    {job.successRate.toFixed(0)}% success
                  </Badge>
                </div>
              </div>
            ))}
            {(!cronJobStats?.jobStatus || cronJobStats.jobStatus.length === 0) && (
              <div className="text-center py-4 text-muted-foreground">
                No job statistics available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
