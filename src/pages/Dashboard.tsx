
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types for our dashboard data
interface DashboardCounts {
  activeTasks: number;
  activeCampaigns: number;
  hoursLogged: number;
  contracts: number;
}

const Dashboard: React.FC = () => {
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
    <div className="mt-4">
      {/* Page Title */}
      <div className="mb-6">
        <h2 className="text-title-md2 font-bold text-black dark:text-white">
          {t('Dashboard')}
        </h2>
      </div>

      {/* Welcome Card */}
      <div className="mb-10 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center gap-4 sm:gap-10">
          <div className="flex-shrink-0">
            <img 
              src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.first_name}+${profile?.last_name}&background=random`}
              alt={`${profile?.first_name} ${profile?.last_name}`} 
              className="h-15 w-15 rounded-full object-cover" 
            />
          </div>
          <div>
            <h3 className="mb-1.5 text-2xl font-semibold text-black dark:text-white">
              {t('Welcome')}, {profile?.first_name} {profile?.last_name}
            </h3>
            <p className="font-medium">
              {isAdmin && "You have administrator access to the portal."}
              {isEmployee && "You have employee access to the portal."}
              {isClient && "You have client access to the portal."}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Admin/Employee specific cards */}
        {(isAdmin || isEmployee) && (
          <>
            <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg
                  className="fill-primary dark:fill-white"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 2.99066 21.3813 3.85003 21.3813H18.1157C18.975 21.3813 19.8 21.0031 20.35 20.3844C20.9 19.7656 21.2094 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5657 19.8344 18.15 19.8344H3.85003C3.43441 19.8344 3.05941 19.6625 2.78441 19.3531C2.50941 19.0438 2.37191 18.6688 2.44066 18.2531L4.12503 3.43751C4.19378 2.71563 4.81253 2.16563 5.56878 2.16563H16.4313C17.1532 2.16563 17.7719 2.71563 17.875 3.43751L19.5938 18.2531C19.6282 18.6688 19.4907 19.0438 19.2157 19.3531Z"
                    fill=""
                  />
                  <path
                    d="M14.3345 5.29375C13.922 5.39688 13.647 5.80938 13.7501 6.22188C13.7845 6.42813 13.8189 6.63438 13.8189 6.80625C13.8189 8.35313 12.547 9.625 11.0001 9.625C9.45327 9.625 8.1814 8.35313 8.1814 6.80625C8.1814 6.6 8.21577 6.42813 8.25015 6.22188C8.35327 5.80938 8.07827 5.39688 7.66577 5.29375C7.25327 5.19063 6.84077 5.46563 6.73765 5.87813C6.6689 6.1875 6.63452 6.49688 6.63452 6.80625C6.63452 9.2125 8.5939 11.1719 11.0001 11.1719C13.4064 11.1719 15.3658 9.2125 15.3658 6.80625C15.3658 6.49688 15.3314 6.1875 15.2626 5.87813C15.1595 5.46563 14.747 5.225 14.3345 5.29375Z"
                    fill=""
                  />
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

            <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg
                  className="fill-primary dark:fill-white"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 2.99066 21.3813 3.85003 21.3813H18.1157C18.975 21.3813 19.8 21.0031 20.35 20.3844C20.9 19.7656 21.2094 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5657 19.8344 18.15 19.8344H3.85003C3.43441 19.8344 3.05941 19.6625 2.78441 19.3531C2.50941 19.0438 2.37191 18.6688 2.44066 18.2531L4.12503 3.43751C4.19378 2.71563 4.81253 2.16563 5.56878 2.16563H16.4313C17.1532 2.16563 17.7719 2.71563 17.875 3.43751L19.5938 18.2531C19.6282 18.6688 19.4907 19.0438 19.2157 19.3531Z"
                    fill=""
                  />
                  <path
                    d="M14.3345 5.29375C13.922 5.39688 13.647 5.80938 13.7501 6.22188C13.7845 6.42813 13.8189 6.63438 13.8189 6.80625C13.8189 8.35313 12.547 9.625 11.0001 9.625C9.45327 9.625 8.1814 8.35313 8.1814 6.80625C8.1814 6.6 8.21577 6.42813 8.25015 6.22188C8.35327 5.80938 8.07827 5.39688 7.66577 5.29375C7.25327 5.19063 6.84077 5.46563 6.73765 5.87813C6.6689 6.1875 6.63452 6.49688 6.63452 6.80625C6.63452 9.2125 8.5939 11.1719 11.0001 11.1719C13.4064 11.1719 15.3658 9.2125 15.3658 6.80625C15.3658 6.49688 15.3314 6.1875 15.2626 5.87813C15.1595 5.46563 14.747 5.225 14.3345 5.29375Z"
                    fill=""
                  />
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

            <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg
                  className="fill-primary dark:fill-white"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.75 21.3125H8.25C3.4375 21.3125 0.6875 18.5625 0.6875 13.75V8.25C0.6875 3.4375 3.4375 0.6875 8.25 0.6875H13.75C18.5625 0.6875 21.3125 3.4375 21.3125 8.25V13.75C21.3125 18.5625 18.5625 21.3125 13.75 21.3125ZM8.25 2.0625C4.1875 2.0625 2.0625 4.1875 2.0625 8.25V13.75C2.0625 17.8125 4.1875 19.9375 8.25 19.9375H13.75C17.8125 19.9375 19.9375 17.8125 19.9375 13.75V8.25C19.9375 4.1875 17.8125 2.0625 13.75 2.0625H8.25Z"
                    fill=""
                  />
                  <path
                    d="M16.8125 11C16.8125 9.5875 16.1375 8.2125 14.8313 7.3813C14.485 7.1625 14.0438 7.26876 13.825 7.61251C13.6063 7.95626 13.7125 8.39751 14.0563 8.61626C14.9813 9.20001 15.4375 10.0688 15.4375 11C15.4375 12.85 13.9188 14.3688 12.0688 14.3688C10.2188 14.3688 8.7 12.85 8.7 11C8.7 9.15001 10.2188 7.63126 12.0688 7.63126C12.4453 7.63126 12.7563 7.32001 12.7563 6.94376C12.7563 6.56751 12.4453 6.25626 12.0688 6.25626C9.45633 6.25626 7.32507 8.38751 7.32507 11C7.32507 13.6125 9.45633 15.7438 12.0688 15.7438C14.6813 15.7438 16.8125 13.6125 16.8125 11Z"
                    fill=""
                  />
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
            <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg
                  className="fill-primary dark:fill-white"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 2.99066 21.3813 3.85003 21.3813H18.1157C18.975 21.3813 19.8 21.0031 20.35 20.3844C20.9 19.7656 21.2094 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5657 19.8344 18.15 19.8344H3.85003C3.43441 19.8344 3.05941 19.6625 2.78441 19.3531C2.50941 19.0438 2.37191 18.6688 2.44066 18.2531L4.12503 3.43751C4.19378 2.71563 4.81253 2.16563 5.56878 2.16563H16.4313C17.1532 2.16563 17.7719 2.71563 17.875 3.43751L19.5938 18.2531C19.6282 18.6688 19.4907 19.0438 19.2157 19.3531Z"
                    fill=""
                  />
                  <path
                    d="M14.3345 5.29375C13.922 5.39688 13.647 5.80938 13.7501 6.22188C13.7845 6.42813 13.8189 6.63438 13.8189 6.80625C13.8189 8.35313 12.547 9.625 11.0001 9.625C9.45327 9.625 8.1814 8.35313 8.1814 6.80625C8.1814 6.6 8.21577 6.42813 8.25015 6.22188C8.35327 5.80938 8.07827 5.39688 7.66577 5.29375C7.25327 5.19063 6.84077 5.46563 6.73765 5.87813C6.6689 6.1875 6.63452 6.49688 6.63452 6.80625C6.63452 9.2125 8.5939 11.1719 11.0001 11.1719C13.4064 11.1719 15.3658 9.2125 15.3658 6.80625C15.3658 6.49688 15.3314 6.1875 15.2626 5.87813C15.1595 5.46563 14.747 5.225 14.3345 5.29375Z"
                    fill=""
                  />
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

            <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <svg
                  className="fill-primary dark:fill-white"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.75 21.3125H8.25C3.4375 21.3125 0.6875 18.5625 0.6875 13.75V8.25C0.6875 3.4375 3.4375 0.6875 8.25 0.6875H13.75C18.5625 0.6875 21.3125 3.4375 21.3125 8.25V13.75C21.3125 18.5625 18.5625 21.3125 13.75 21.3125ZM8.25 2.0625C4.1875 2.0625 2.0625 4.1875 2.0625 8.25V13.75C2.0625 17.8125 4.1875 19.9375 8.25 19.9375H13.75C17.8125 19.9375 19.9375 17.8125 19.9375 13.75V8.25C19.9375 4.1875 17.8125 2.0625 13.75 2.0625H8.25Z"
                    fill=""
                  />
                  <path
                    d="M16.8125 11C16.8125 9.5875 16.1375 8.2125 14.8313 7.3813C14.485 7.1625 14.0438 7.26876 13.825 7.61251C13.6063 7.95626 13.7125 8.39751 14.0563 8.61626C14.9813 9.20001 15.4375 10.0688 15.4375 11C15.4375 12.85 13.9188 14.3688 12.0688 14.3688C10.2188 14.3688 8.7 12.85 8.7 11C8.7 9.15001 10.2188 7.63126 12.0688 7.63126C12.4453 7.63126 12.7563 7.32001 12.7563 6.94376C12.7563 6.56751 12.4453 6.25626 12.0688 6.25626C9.45633 6.25626 7.32507 8.38751 7.32507 11C7.32507 13.6125 9.45633 15.7438 12.0688 15.7438C14.6813 15.7438 16.8125 13.6125 16.8125 11Z"
                    fill=""
                  />
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
