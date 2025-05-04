
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

  // Initialize tabs after component mounts
  useEffect(() => {
    // Check if playfulUI exists before trying to access its properties
    if (typeof window !== 'undefined' && window.playfulUI && window.playfulUI.initTabs) {
      window.playfulUI.initTabs();
    }
  }, []);

  return (
    <div className="playful-container">
      <h1 className="playful-text-2xl playful-font-bold playful-mb-4">
        {t('Dashboard')}
      </h1>

      <div className="playful-row playful-mb-4">
        {/* Welcome Card */}
        <div className="playful-col playful-col-full">
          <div className="playful-card playful-card-gradient">
            <div className="playful-card-content">
              <h2 className="playful-text-xl playful-font-bold playful-mb-2">
                {t('Welcome')}, {profile?.first_name} {profile?.last_name}
              </h2>
              <p>
                {isAdmin && "You have administrator access to the portal."}
                {isEmployee && "You have employee access to the portal."}
                {isClient && "You have client access to the portal."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="playful-row">
        {/* Admin/Employee specific cards */}
        {(isAdmin || isEmployee) && (
          <>
            <div className="playful-col playful-col-third playful-mb-4">
              <div className="playful-stat-card playful-card-decorated primary">
                <div className="playful-stat-header">
                  <div className="playful-stat-title">{t('Active Tasks')}</div>
                  <div className="playful-stat-badge playful-stat-badge-up">+5%</div>
                </div>
                <div className="playful-stat-value">
                  {isLoading ? '...' : dashboardData?.activeTasks || 0}
                </div>
                <div className="playful-stat-desc">Tasks requiring attention</div>
              </div>
            </div>

            <div className="playful-col playful-col-third playful-mb-4">
              <div className="playful-stat-card playful-card-decorated secondary">
                <div className="playful-stat-header">
                  <div className="playful-stat-title">{t('Active Campaigns')}</div>
                  <div className="playful-stat-badge playful-stat-badge-up">+12%</div>
                </div>
                <div className="playful-stat-value">
                  {isLoading ? '...' : dashboardData?.activeCampaigns || 0}
                </div>
                <div className="playful-stat-desc">Running campaigns</div>
              </div>
            </div>

            <div className="playful-col playful-col-third playful-mb-4">
              <div className="playful-stat-card playful-card-decorated">
                <div className="playful-stat-header">
                  <div className="playful-stat-title">{t('Hours Logged This Week')}</div>
                  <div className="playful-stat-badge playful-stat-badge-down">-2%</div>
                </div>
                <div className="playful-stat-value">
                  {isLoading ? '...' : dashboardData?.hoursLogged || 0}
                </div>
                <div className="playful-stat-desc">Total hours this week</div>
              </div>
            </div>
          </>
        )}

        {/* Client specific cards */}
        {isClient && (
          <>
            <div className="playful-col playful-col-half playful-mb-4">
              <div className="playful-stat-card playful-card-decorated secondary">
                <div className="playful-stat-header">
                  <div className="playful-stat-title">{t('Active Campaigns')}</div>
                  <div className="playful-stat-badge playful-stat-badge-up">+8%</div>
                </div>
                <div className="playful-stat-value">
                  {isLoading ? '...' : dashboardData?.activeCampaigns || 0}
                </div>
                <div className="playful-stat-desc">Currently active campaigns</div>
              </div>
            </div>

            <div className="playful-col playful-col-half playful-mb-4">
              <div className="playful-stat-card playful-card-decorated">
                <div className="playful-stat-header">
                  <div className="playful-stat-title">{t('Contracts')}</div>
                </div>
                <div className="playful-stat-value">
                  {isLoading ? '...' : dashboardData?.contracts || 0}
                </div>
                <div className="playful-stat-desc">Active contracts</div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="playful-row">
        <div className="playful-col playful-mb-4">
          <div className="playful-card">
            <div className="playful-card-header">
              <h3 className="playful-card-title">Recent Activity</h3>
            </div>
            <div className="playful-card-content">
              <div className="playful-activity-item">
                <div className="playful-activity-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div className="playful-activity-content">
                  <div className="playful-activity-title">
                    <span className="playful-activity-name">Jamie Smith</span> updated account settings
                  </div>
                  <div className="playful-activity-time">Today, 10:15</div>
                </div>
              </div>
              
              <div className="playful-activity-item">
                <div className="playful-activity-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                </div>
                <div className="playful-activity-content">
                  <div className="playful-activity-title">
                    <span className="playful-activity-name">Alex Johnson</span> logged in
                  </div>
                  <div className="playful-activity-time">Today, 12:05</div>
                </div>
              </div>
              
              <div className="playful-activity-item">
                <div className="playful-activity-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                  </svg>
                </div>
                <div className="playful-activity-content">
                  <div className="playful-activity-title">
                    <span className="playful-activity-name">Morgan Lee</span> added a new savings goal for vacation
                  </div>
                  <div className="playful-activity-time">Today, 14:30</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
