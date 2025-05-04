
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

  useEffect(() => {
    // Initialize charts when data is available and window.PlayfulUI is loaded
    if (!isLoading && dashboardData && window.PlayfulUI) {
      const salesData = [
        { label: '1 Jul', value1: 30, value2: 40 },
        { label: '2 Jul', value1: 25, value2: 45 },
        { label: '3 Jul', value1: 40, value2: 60 },
        { label: '4 Jul', value1: 35, value2: 40 },
        { label: '5 Jul', value1: 45, value2: 50 },
        { label: '6 Jul', value1: 20, value2: 30 },
        { label: '7 Jul', value1: 25, value2: 45 },
        { label: '8 Jul', value1: 35, value2: 40 },
        { label: '9 Jul', value1: 30, value2: 35 },
        { label: '10 Jul', value1: 40, value2: 45 },
        { label: '11 Jul', value1: 45, value2: 50 },
        { label: '12 Jul', value1: 55, value2: 45 }
      ];
      
      const chartContainer = document.getElementById('sales-chart');
      if (chartContainer) {
        window.PlayfulUI.createBarChart(chartContainer, salesData);
      }
    }
  }, [isLoading, dashboardData]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <h1 className="welcome-title">{t('Welcome')}, {profile?.first_name}</h1>
        <p className="welcome-subtitle">
          {isAdmin && "You have administrator access to the portal."}
          {isEmployee && "You have employee access to the portal."}
          {isClient && "You have client access to the portal."}
        </p>
        <div className="quick-actions">
          <button className="quick-action-btn">View Reports</button>
          <button className="quick-action-btn">Create Task</button>
          <button className="quick-action-btn">Manage Users</button>
        </div>
      </div>

      <div className="dashboard-stats">
        {(isAdmin || isEmployee) && (
          <>
            <div className="stats-card">
              <div className="stats-card-header">
                <div className="stats-card-icon icon-customers">
                  <i className="icon-users"></i>
                </div>
                <div className="stats-card-trend trend-up">
                  <span>2.5%</span>
                  <span>↑</span>
                </div>
              </div>
              <div className="stats-title">{t('Active Tasks')}</div>
              <div className="stats-value">
                {isLoading ? '...' : dashboardData?.activeTasks || 0}
              </div>
            </div>

            <div className="stats-card">
              <div className="stats-card-header">
                <div className="stats-card-icon icon-revenue">
                  <i className="icon-chart"></i>
                </div>
                <div className="stats-card-trend trend-up">
                  <span>0.5%</span>
                  <span>↑</span>
                </div>
              </div>
              <div className="stats-title">{t('Active Campaigns')}</div>
              <div className="stats-value">
                {isLoading ? '...' : dashboardData?.activeCampaigns || 0}
              </div>
            </div>

            <div className="stats-card">
              <div className="stats-card-header">
                <div className="stats-card-icon icon-orders">
                  <i className="icon-clock"></i>
                </div>
                <div className="stats-card-trend trend-up">
                  <span>1.2%</span>
                  <span>↑</span>
                </div>
              </div>
              <div className="stats-title">{t('Hours Logged This Week')}</div>
              <div className="stats-value">
                {isLoading ? '...' : dashboardData?.hoursLogged || 0}
              </div>
            </div>
          </>
        )}

        {/* Client specific cards */}
        {isClient && (
          <>
            <div className="stats-card">
              <div className="stats-card-header">
                <div className="stats-card-icon icon-revenue">
                  <i className="icon-chart"></i>
                </div>
                <div className="stats-card-trend trend-up">
                  <span>0.5%</span>
                  <span>↑</span>
                </div>
              </div>
              <div className="stats-title">{t('Active Campaigns')}</div>
              <div className="stats-value">
                {isLoading ? '...' : dashboardData?.activeCampaigns || 0}
              </div>
            </div>

            <div className="stats-card">
              <div className="stats-card-header">
                <div className="stats-card-icon icon-returns">
                  <i className="icon-file"></i>
                </div>
                <div className="stats-card-trend trend-up">
                  <span>0.8%</span>
                  <span>↑</span>
                </div>
              </div>
              <div className="stats-title">{t('Contracts')}</div>
              <div className="stats-value">
                {isLoading ? '...' : dashboardData?.contracts || 0}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="chart-container">
          <div className="chart-header">
            <h2 className="chart-title">Product sales</h2>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-dot" style={{ backgroundColor: 'var(--secondary)' }}></div>
                <span className="legend-label">Gross margin</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ backgroundColor: 'var(--primary)' }}></div>
                <span className="legend-label">Revenue</span>
              </div>
            </div>
          </div>
          
          <div className="metrics-chart">
            <div id="sales-chart" className="bar-chart"></div>
            <div className="metric-highlight">
              <p className="metric-highlight-value">$52,187</p>
              <p className="metric-highlight-label">2.5% ↑</p>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h2 className="chart-title">Sales by product category</h2>
          </div>
          
          <div className="donut-chart">
            <div className="chart-placeholder">
              <div style={{ width: '300px', height: '300px', margin: '0 auto', position: 'relative', borderRadius: '50%', background: 'conic-gradient(var(--primary) 0% 25%, var(--secondary) 25% 42%, #FFB83D 42% 54%, #FF5252 54% 64%, #E2D1C3 64% 73%, #C1E5FE 73% 81%, #B5F0DD 81% 87%, #F8D6FF 87% 93%, #FFE29F 93% 100%)' }}>
                <div style={{ position: 'absolute', width: '150px', height: '150px', background: 'white', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
              </div>
            </div>
            
            <div className="product-categories">
              <div className="category-list">
                <div className="category-item">
                  <span className="category-dot" style={{ backgroundColor: 'var(--primary)' }}></span>
                  <span className="category-name">Living room</span>
                  <span className="category-value">25%</span>
                </div>
                <div className="category-item">
                  <span className="category-dot" style={{ backgroundColor: 'var(--secondary)' }}></span>
                  <span className="category-name">Kids</span>
                  <span className="category-value">17%</span>
                </div>
                <div className="category-item">
                  <span className="category-dot" style={{ backgroundColor: '#FFB83D' }}></span>
                  <span className="category-name">Office</span>
                  <span className="category-value">13%</span>
                </div>
                <div className="category-item">
                  <span className="category-dot" style={{ backgroundColor: '#FF5252' }}></span>
                  <span className="category-name">Bedroom</span>
                  <span className="category-value">12%</span>
                </div>
                <div className="category-item">
                  <span className="category-dot" style={{ backgroundColor: '#E2D1C3' }}></span>
                  <span className="category-name">Kitchen</span>
                  <span className="category-value">9%</span>
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
