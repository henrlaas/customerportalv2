
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
    <div>
      {/* Welcome Title */}
      <div className="mb-6">
        <h2 className="text-title-xl1 font-bold text-black dark:text-white">
          {t('Dashboard')}
        </h2>
      </div>
      
      {/* Welcome Card */}
      <div className="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-8 mb-7.5">
        <h3 className="text-xl font-semibold text-black dark:text-white">
          {t('Welcome')}, {profile?.first_name} {profile?.last_name}
        </h3>
        <p className="mt-3 font-medium text-body-color">
          {isAdmin && "You have administrator access to the portal."}
          {isEmployee && "You have employee access to the portal."}
          {isClient && "You have client access to the portal."}
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
        {/* Admin/Employee specific cards */}
        {(isAdmin || isEmployee) && (
          <>
            <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 10H3M21 10L15 16M21 10L15 4" stroke="#3C50E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <h4 className="text-title-md font-bold text-black dark:text-white">
                    {isLoading ? '...' : dashboardData?.activeTasks || 0}
                  </h4>
                  <span className="text-sm font-medium">{t('Active Tasks')}</span>
                </div>
              </div>
            </div>

            <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 9.5H16M11 13.5H16M5 9.5H5.01M5 13.5H5.01M3 16.5V8.5C3 7.4 3.4 6.5 4.22 5.78C5.04 5.06 5.98 4.5 7 4.5H13C14.02 4.5 14.96 4.94 15.78 5.66C16.6 6.38 17 7.4 17 8.5V16.5C17 17.6 16.6 18.5 15.78 19.22C14.96 19.94 14.02 20.5 13 20.5H7C5.98 20.5 5.04 20.06 4.22 19.34C3.4 18.62 3 17.6 3 16.5Z" stroke="#3C50E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <h4 className="text-title-md font-bold text-black dark:text-white">
                    {isLoading ? '...' : dashboardData?.activeCampaigns || 0}
                  </h4>
                  <span className="text-sm font-medium">{t('Active Campaigns')}</span>
                </div>
              </div>
            </div>

            <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 11H8.01M12 11H12.01M16 11H16.01M21 10.5C21 16.0228 16.5228 20.5 11 20.5C5.47715 20.5 1 16.0228 1 10.5C1 4.97715 5.47715 0.5 11 0.5C16.5228 0.5 21 4.97715 21 10.5Z" stroke="#3C50E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <h4 className="text-title-md font-bold text-black dark:text-white">
                    {isLoading ? '...' : dashboardData?.hoursLogged || 0}
                  </h4>
                  <span className="text-sm font-medium">{t('Hours Logged This Week')}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Client specific cards */}
        {isClient && (
          <>
            <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 9.5H16M11 13.5H16M5 9.5H5.01M5 13.5H5.01M3 16.5V8.5C3 7.4 3.4 6.5 4.22 5.78C5.04 5.06 5.98 4.5 7 4.5H13C14.02 4.5 14.96 4.94 15.78 5.66C16.6 6.38 17 7.4 17 8.5V16.5C17 17.6 16.6 18.5 15.78 19.22C14.96 19.94 14.02 20.5 13 20.5H7C5.98 20.5 5.04 20.06 4.22 19.34C3.4 18.62 3 17.6 3 16.5Z" stroke="#3C50E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <h4 className="text-title-md font-bold text-black dark:text-white">
                    {isLoading ? '...' : dashboardData?.activeCampaigns || 0}
                  </h4>
                  <span className="text-sm font-medium">{t('Active Campaigns')}</span>
                </div>
              </div>
            </div>

            <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2.26953V6.40007H18.1306M14 11.4001H21M3 11.4001H10M3 16.4001H21M11 6.40007V2.26953L2 11.4001L11 20.5306V16.4001" stroke="#3C50E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <h4 className="text-title-md font-bold text-black dark:text-white">
                    {isLoading ? '...' : dashboardData?.contracts || 0}
                  </h4>
                  <span className="text-sm font-medium">{t('Contracts')}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
