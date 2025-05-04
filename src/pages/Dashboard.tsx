
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

// Types for our dashboard data
interface DashboardCounts {
  activeTasks: number;
  activeCampaigns: number;
  hoursLogged: number;
  contracts: number;
}

const Dashboard = () => {
  const { profile, isAdmin, isEmployee, isClient } = useAuth();
  const t = useTranslation();

  // Query for fetching dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const counts: DashboardCounts = {
        activeTasks: 0,
        activeCampaigns: 0,
        hoursLogged: 0,
        contracts: 0
      };
      
      try {
        // Fetch tasks count (todo and in-progress)
        if (isAdmin || isEmployee) {
          const { count: tasksCount, error: tasksError } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .in('status', ['todo', 'in-progress']);
            
          if (tasksError) throw tasksError;
          counts.activeTasks = tasksCount || 0;
        }
        
        // Fetch active campaigns
        const { count: campaignsCount, error: campaignsError } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
          
        if (campaignsError) throw campaignsError;
        counts.activeCampaigns = campaignsCount || 0;
        
        // Fetch hours logged this week for employee/admin
        if (isAdmin || isEmployee) {
          const today = new Date();
          const startOfWeek = new Date(today);
          // Set to the start of the current week (Sunday)
          startOfWeek.setDate(today.getDate() - today.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          
          const { data: timeEntries, error: timeError } = await supabase
            .from('time_entries')
            .select('start_time, end_time')
            .gte('start_time', startOfWeek.toISOString())
            .not('end_time', 'is', null);
            
          if (timeError) throw timeError;
          
          // Calculate total hours
          let totalHours = 0;
          if (timeEntries) {
            timeEntries.forEach(entry => {
              if (entry.start_time && entry.end_time) {
                const start = new Date(entry.start_time);
                const end = new Date(entry.end_time);
                const diffMs = end.getTime() - start.getTime();
                const diffHours = diffMs / (1000 * 60 * 60);
                totalHours += diffHours;
              }
            });
          }
          counts.hoursLogged = Number(totalHours.toFixed(1));
        }
        
        // Fetch contracts for clients
        if (isClient) {
          const { count: contractsCount, error: contractsError } = await supabase
            .from('contracts')
            .select('*', { count: 'exact', head: true });
            
          if (contractsError) throw contractsError;
          counts.contracts = contractsCount || 0;
        }
        
        return counts;
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return counts; // Return default counts on error
      }
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        {t('Dashboard')}
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Welcome Card */}
        <Card className="col-span-full bg-white border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>
              {t('Welcome')}, {profile?.first_name} {profile?.last_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {isAdmin && "You have administrator access to the portal."}
              {isEmployee && "You have employee access to the portal."}
              {isClient && "You have client access to the portal."}
            </p>
          </CardContent>
        </Card>

        {/* Admin/Employee specific cards */}
        {(isAdmin || isEmployee) && (
          <>
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">{t('Active Tasks')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {isLoading ? '...' : dashboardData?.activeTasks || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">{t('Active Campaigns')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {isLoading ? '...' : dashboardData?.activeCampaigns || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">{t('Hours Logged This Week')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {isLoading ? '...' : dashboardData?.hoursLogged || 0}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Client specific cards */}
        {isClient && (
          <>
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">{t('Active Campaigns')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {isLoading ? '...' : dashboardData?.activeCampaigns || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium">{t('Contracts')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {isLoading ? '...' : dashboardData?.contracts || 0}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
