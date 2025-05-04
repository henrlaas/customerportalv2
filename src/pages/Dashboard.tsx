
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Users, BookOpen, Clock } from 'lucide-react';

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
        <h1 className="page-title">{t('Dashboard')}</h1>
        <p className="page-subtitle">Welcome back, {profile?.first_name}! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Welcome Card */}
        <div className="card animate-slide-in">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="feature-card-icon">
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h2 className="font-bold mb-1">Welcome, {profile?.first_name}!</h2>
                <p className="text-gray">
                  {isAdmin && "You have administrator access to the portal."}
                  {isEmployee && "You have employee access to the portal."}
                  {isClient && "You have client access to the portal."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin/Employee specific cards */}
        {(isAdmin || isEmployee) && (
          <>
            <div className="card card-primary animate-slide-in" style={{ animationDelay: '100ms' }}>
              <div className="card-body">
                <div className="stat-card">
                  <div className="stat-card-title">{t('Active Tasks')}</div>
                  <div className="stat-card-value">
                    {isLoading ? '...' : dashboardData?.activeTasks || 0}
                  </div>
                  <div className="stat-card-change positive">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                      <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                    <span>12% this week</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-secondary animate-slide-in" style={{ animationDelay: '200ms' }}>
              <div className="card-body">
                <div className="stat-card">
                  <div className="stat-card-title">{t('Active Campaigns')}</div>
                  <div className="stat-card-value">
                    {isLoading ? '...' : dashboardData?.activeCampaigns || 0}
                  </div>
                  <div className="stat-card-change positive">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                      <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                    <span>5% this month</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick shortcuts section */}
      <h2 className="text-xl font-semibold mb-4">Quick Shortcuts</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <a href="/campaigns" className="card card-hover-effect">
          <div className="card-body">
            <div className="flex flex-col items-center text-center p-4">
              <div className="feature-card-icon animate-bounce">
                <BookOpen size={20} />
              </div>
              <h3 className="mt-3 font-medium">Campaigns</h3>
            </div>
          </div>
        </a>
        
        <a href="/tasks" className="card card-hover-effect">
          <div className="card-body">
            <div className="flex flex-col items-center text-center p-4">
              <div className="feature-card-icon animate-bounce" style={{ animationDelay: '0.1s' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 12H3"></path>
                  <path d="m16 6-4 4 4 4"></path>
                  <path d="M21 12h-5"></path>
                </svg>
              </div>
              <h3 className="mt-3 font-medium">Tasks</h3>
            </div>
          </div>
        </a>
        
        <a href="/time-tracking" className="card card-hover-effect">
          <div className="card-body">
            <div className="flex flex-col items-center text-center p-4">
              <div className="feature-card-icon animate-bounce" style={{ animationDelay: '0.2s' }}>
                <Clock size={20} />
              </div>
              <h3 className="mt-3 font-medium">Time Tracking</h3>
            </div>
          </div>
        </a>
        
        <a href="/companies" className="card card-hover-effect">
          <div className="card-body">
            <div className="flex flex-col items-center text-center p-4">
              <div className="feature-card-icon animate-bounce" style={{ animationDelay: '0.3s' }}>
                <Users size={20} />
              </div>
              <h3 className="mt-3 font-medium">Companies</h3>
            </div>
          </div>
        </a>
      </div>

      {/* Recent activity - simulated data */}
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Latest Updates</h3>
        </div>
        <div className="card-body p-0">
          <div className="table-container">
            <table className="table table-hoverable">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="badge badge-primary">Task</span></td>
                  <td>Update campaign analytics dashboard</td>
                  <td>Today, 10:30 AM</td>
                  <td><span className="badge badge-warning">In Progress</span></td>
                </tr>
                <tr>
                  <td><span className="badge badge-secondary">Campaign</span></td>
                  <td>Summer Sale Facebook Ad Campaign</td>
                  <td>Yesterday</td>
                  <td><span className="badge badge-success">Active</span></td>
                </tr>
                <tr>
                  <td><span className="badge badge-info">Meeting</span></td>
                  <td>Client onboarding call</td>
                  <td>Yesterday</td>
                  <td><span className="badge badge-success">Completed</span></td>
                </tr>
                <tr>
                  <td><span className="badge badge-danger">Contract</span></td>
                  <td>New service agreement with Acme Corp</td>
                  <td>June 2, 2025</td>
                  <td><span className="badge badge-info">Draft</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
