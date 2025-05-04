
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, CheckSquare, Clock, FileText } from 'lucide-react';

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
    <div className="custom-slide-in-right">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="custom-card col-span-full">
          <div className="custom-card-header">
            <h2 className="custom-card-title">{t('Welcome')}, {profile?.first_name}!</h2>
          </div>
          <div className="custom-card-content">
            <p>
              {isAdmin && "You have administrator access to the portal."}
              {isEmployee && "You have employee access to the portal."}
              {isClient && "You have client access to the portal."}
            </p>
          </div>
        </div>

        {/* Admin/Employee specific cards */}
        {(isAdmin || isEmployee) && (
          <>
            <div className="custom-card custom-fade-in">
              <div className="custom-flex custom-justify-between custom-mb-3">
                <div className="custom-flex custom-items-center custom-gap-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <CheckSquare size={24} className="text-blue-600" />
                  </div>
                  <span className="custom-text-primary custom-text-lg">{t('Active Tasks')}</span>
                </div>
              </div>
              <div className="custom-flex custom-justify-between custom-items-end">
                <div className="custom-text-xl custom-text-bold">
                  {isLoading ? '...' : dashboardData?.activeTasks || 0}
                </div>
                <span className="custom-badge custom-badge-primary">
                  {isLoading ? '' : '+5% this week'}
                </span>
              </div>
            </div>

            <div className="custom-card custom-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="custom-flex custom-justify-between custom-mb-3">
                <div className="custom-flex custom-items-center custom-gap-2">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <BarChart size={24} className="text-green-600" />
                  </div>
                  <span className="custom-text-primary custom-text-lg">{t('Active Campaigns')}</span>
                </div>
              </div>
              <div className="custom-flex custom-justify-between custom-items-end">
                <div className="custom-text-xl custom-text-bold">
                  {isLoading ? '...' : dashboardData?.activeCampaigns || 0}
                </div>
                <span className="custom-badge custom-badge-success">
                  {isLoading ? '' : '+2% this month'}
                </span>
              </div>
            </div>

            <div className="custom-card custom-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="custom-flex custom-justify-between custom-mb-3">
                <div className="custom-flex custom-items-center custom-gap-2">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Clock size={24} className="text-purple-600" />
                  </div>
                  <span className="custom-text-primary custom-text-lg">{t('Hours Logged This Week')}</span>
                </div>
              </div>
              <div className="custom-flex custom-justify-between custom-items-end">
                <div className="custom-text-xl custom-text-bold">
                  {isLoading ? '...' : dashboardData?.hoursLogged || 0}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Client specific cards */}
        {isClient && (
          <>
            <div className="custom-card custom-fade-in">
              <div className="custom-flex custom-justify-between custom-mb-3">
                <div className="custom-flex custom-items-center custom-gap-2">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <BarChart size={24} className="text-green-600" />
                  </div>
                  <span className="custom-text-primary custom-text-lg">{t('Active Campaigns')}</span>
                </div>
              </div>
              <div className="custom-flex custom-justify-between custom-items-end">
                <div className="custom-text-xl custom-text-bold">
                  {isLoading ? '...' : dashboardData?.activeCampaigns || 0}
                </div>
              </div>
            </div>

            <div className="custom-card custom-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="custom-flex custom-justify-between custom-mb-3">
                <div className="custom-flex custom-items-center custom-gap-2">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <FileText size={24} className="text-amber-600" />
                  </div>
                  <span className="custom-text-primary custom-text-lg">{t('Contracts')}</span>
                </div>
              </div>
              <div className="custom-flex custom-justify-between custom-items-end">
                <div className="custom-text-xl custom-text-bold">
                  {isLoading ? '...' : dashboardData?.contracts || 0}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Additional Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="custom-card">
          <div className="custom-card-header">
            <h3 className="custom-card-title">{t('Recent Activity')}</h3>
          </div>
          <div className="custom-card-content">
            <ul className="space-y-3">
              <li className="custom-flex custom-justify-between items-center border-b pb-2">
                <div className="custom-flex custom-items-center custom-gap-2">
                  <div className="custom-avatar custom-avatar-sm">JD</div>
                  <div>
                    <p className="custom-text-primary custom-mb-0">Jane Doe added a new task</p>
                    <p className="custom-text-tertiary custom-text-sm custom-mb-0">Campaign: Summer Launch</p>
                  </div>
                </div>
                <span className="custom-text-tertiary custom-text-sm">2h ago</span>
              </li>
              <li className="custom-flex custom-justify-between items-center border-b pb-2">
                <div className="custom-flex custom-items-center custom-gap-2">
                  <div className="custom-avatar custom-avatar-sm">MS</div>
                  <div>
                    <p className="custom-text-primary custom-mb-0">Mark Smith updated campaign status</p>
                    <p className="custom-text-tertiary custom-text-sm custom-mb-0">From "Planning" to "Active"</p>
                  </div>
                </div>
                <span className="custom-text-tertiary custom-text-sm">5h ago</span>
              </li>
              <li className="custom-flex custom-justify-between items-center">
                <div className="custom-flex custom-items-center custom-gap-2">
                  <div className="custom-avatar custom-avatar-sm">AL</div>
                  <div>
                    <p className="custom-text-primary custom-mb-0">Amy Lee uploaded new documents</p>
                    <p className="custom-text-tertiary custom-text-sm custom-mb-0">Contract: Q3 Marketing Plan</p>
                  </div>
                </div>
                <span className="custom-text-tertiary custom-text-sm">1d ago</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="custom-card">
          <div className="custom-card-header">
            <h3 className="custom-card-title">{t('Upcoming Tasks')}</h3>
          </div>
          <div className="custom-card-content">
            <ul className="space-y-3">
              <li className="custom-flex custom-items-center custom-justify-between border-b pb-2">
                <div className="custom-flex custom-items-center custom-gap-2">
                  <div className="custom-checkbox">
                    <input type="checkbox" id="task1" />
                    <label className="custom-checkbox-label" htmlFor="task1">
                      Finalize Q3 marketing strategy
                    </label>
                  </div>
                </div>
                <span className="custom-badge">Due Today</span>
              </li>
              <li className="custom-flex custom-items-center custom-justify-between border-b pb-2">
                <div className="custom-flex custom-items-center custom-gap-2">
                  <div className="custom-checkbox">
                    <input type="checkbox" id="task2" />
                    <label className="custom-checkbox-label" htmlFor="task2">
                      Review campaign analytics
                    </label>
                  </div>
                </div>
                <span className="custom-badge">Tomorrow</span>
              </li>
              <li className="custom-flex custom-items-center custom-justify-between">
                <div className="custom-flex custom-items-center custom-gap-2">
                  <div className="custom-checkbox">
                    <input type="checkbox" id="task3" />
                    <label className="custom-checkbox-label" htmlFor="task3">
                      Client meeting - ABC Corp
                    </label>
                  </div>
                </div>
                <span className="custom-badge">Jul 15</span>
              </li>
            </ul>
            <button className="custom-btn custom-btn-primary custom-mt-3 w-full">
              View All Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
