
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  Users,
  CheckSquare,
  Clock,
  FileText,
  DollarSign,
} from 'lucide-react';

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
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('Dashboard')}</h1>
          <p className="text-gray">Welcome back, {profile?.first_name}</p>
        </div>
      </div>

      <div className="stat-grid">
        {/* Welcome Card */}
        <div className="card card-welcome">
          <div className="card-content">
            <h2 className="welcome-title">
              {t('Welcome')}, {profile?.first_name} {profile?.last_name}
            </h2>
            <p className="welcome-message">
              {isAdmin && "You have administrator access to the portal."}
              {isEmployee && "You have employee access to the portal."}
              {isClient && "You have client access to the portal."}
            </p>
          </div>
        </div>

        {/* Admin/Employee specific cards */}
        {(isAdmin || isEmployee) && (
          <>
            <div className="stat-card">
              <div className="stat-icon">
                <CheckSquare size={24} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">{t('Active Tasks')}</h3>
                <div className="stat-value">
                  {isLoading ? '...' : dashboardData?.activeTasks || 0}
                </div>
                <div className="stat-desc">
                  <ArrowUpRight className="stat-indicator-up" size={14} />
                  <span>5% increase</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">{t('Active Campaigns')}</h3>
                <div className="stat-value">
                  {isLoading ? '...' : dashboardData?.activeCampaigns || 0}
                </div>
                <div className="stat-desc">
                  <ArrowUpRight className="stat-indicator-up" size={14} />
                  <span>12% increase</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">{t('Hours Logged This Week')}</h3>
                <div className="stat-value">
                  {isLoading ? '...' : dashboardData?.hoursLogged || 0}
                </div>
                <div className="stat-desc">
                  <ArrowDownRight className="stat-indicator-down" size={14} />
                  <span>3% decrease</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Client specific cards */}
        {isClient && (
          <>
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">{t('Active Campaigns')}</h3>
                <div className="stat-value">
                  {isLoading ? '...' : dashboardData?.activeCampaigns || 0}
                </div>
                <div className="stat-desc">
                  <ArrowUpRight className="stat-indicator-up" size={14} />
                  <span>8% increase</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FileText size={24} />
              </div>
              <div className="stat-content">
                <h3 className="stat-title">{t('Contracts')}</h3>
                <div className="stat-value">
                  {isLoading ? '...' : dashboardData?.contracts || 0}
                </div>
                <div className="stat-desc">
                  <span>No change</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card mt-6">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
        </div>
        <div className="card-content">
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <CheckSquare size={18} />
              </div>
              <div className="activity-content">
                <p className="activity-text">Task "Update Homepage Design" was completed</p>
                <p className="activity-time">2 hours ago</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <Users size={18} />
              </div>
              <div className="activity-content">
                <p className="activity-text">New campaign "Summer Promotion" was created</p>
                <p className="activity-time">Yesterday</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <FileText size={18} />
              </div>
              <div className="activity-content">
                <p className="activity-text">Contract #1234 was signed by the client</p>
                <p className="activity-time">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
