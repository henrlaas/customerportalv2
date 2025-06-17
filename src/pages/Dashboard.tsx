import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { DashboardCharts } from '@/components/Dashboard/DashboardCharts';
import { TasksSummary } from '@/components/Dashboard/TasksSummary';
import { CampaignsSummary } from '@/components/Dashboard/CampaignsSummary';
import { CompaniesSummary } from '@/components/Dashboard/CompaniesSummary';
import { DealsSummary } from '@/components/Dashboard/DealsSummary';
import { MrrChart } from '@/components/Dashboard/MrrChart';
import { UserDashboard } from '@/components/Dashboard/UserDashboard/UserDashboard';
import { ArrowDownIcon, ArrowUpIcon, BarChart3, CheckIcon, ChartBarIcon, CircleDollarSignIcon, LayoutDashboard, SquareCheckIcon, SquareCode } from 'lucide-react';

// Types for our dashboard data
interface DashboardCounts {
  activeTasks: number;
  completedTasks: number;
  overdueTasks: number;
  activeCampaigns: number;
  readyCampaigns: number;
  inProgressCampaigns: number;
  totalCompanies: number;
  marketingCompanies: number;
  webCompanies: number;
  hoursLogged: number;
  contracts: number;
  totalMrr: number;
  totalDeals: number;
  openDeals: number;
  totalDealsValue: number;
}

const Dashboard = () => {
  const { profile, isAdmin, isEmployee, isClient } = useAuth();
  const t = useTranslation();
  
  // If user is admin or employee, show the new user-specific dashboard
  if (isAdmin || isEmployee) {
    return (
      <div className="h-screen flex flex-col">
        <UserDashboard />
      </div>
    );
  }
  
  // Query for fetching dashboard data (for clients)
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const counts: DashboardCounts = {
        activeTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        activeCampaigns: 0,
        readyCampaigns: 0,
        inProgressCampaigns: 0,
        totalCompanies: 0,
        marketingCompanies: 0,
        webCompanies: 0,
        hoursLogged: 0,
        contracts: 0,
        totalMrr: 0,
        totalDeals: 0,
        openDeals: 0,
        totalDealsValue: 0
      };
      
      try {
        // Fetch tasks counts
        if (isAdmin || isEmployee) {
          // Active tasks (todo and in-progress)
          const { count: activeTasksCount, error: tasksError } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .in('status', ['todo', 'in-progress']);
            
          if (tasksError) throw tasksError;
          counts.activeTasks = activeTasksCount || 0;
          
          // Completed tasks
          const { count: completedTasksCount, error: completedTasksError } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed');
            
          if (completedTasksError) throw completedTasksError;
          counts.completedTasks = completedTasksCount || 0;
          
          // Overdue tasks
          const today = new Date();
          const { count: overdueTasksCount, error: overdueTasksError } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .in('status', ['todo', 'in-progress'])
            .lt('due_date', today.toISOString());
            
          if (overdueTasksError) throw overdueTasksError;
          counts.overdueTasks = overdueTasksCount || 0;
        }
        
        // Fetch campaigns counts
        const { data: campaigns, error: campaignsError } = await supabase
          .from('campaigns')
          .select('*');
          
        if (campaignsError) throw campaignsError;
        
        counts.activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
        counts.readyCampaigns = campaigns?.filter(c => c.status === 'ready').length || 0;
        counts.inProgressCampaigns = campaigns?.filter(c => c.status === 'in-progress').length || 0;
        
        // Fetch companies
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('*');
          
        if (companiesError) throw companiesError;
        
        counts.totalCompanies = companies?.length || 0;
        counts.marketingCompanies = companies?.filter(c => c.is_marketing_client).length || 0;
        counts.webCompanies = companies?.filter(c => c.is_web_client).length || 0;
        
        // Calculate total MRR
        let totalMrr = 0;
        companies?.forEach(company => {
          if (company.mrr && !isNaN(company.mrr)) {
            totalMrr += Number(company.mrr);
          }
        });
        counts.totalMrr = totalMrr;
        
        // Fetch deals
        const { data: deals, error: dealsError } = await supabase
          .from('deals')
          .select('*');
          
        if (dealsError) throw dealsError;
        
        counts.totalDeals = deals?.length || 0;
        
        // Get deal stages to identify which ones are open/not closed
        const { data: dealStages, error: dealStagesError } = await supabase
          .from('deal_stages')
          .select('*')
          .order('position', { ascending: true });
          
        if (dealStagesError) throw dealStagesError;
        
        // Determine which deals are not closed (assuming the last stage is "closed" or similar)
        if (dealStages && dealStages.length > 0) {
          const closedStageId = dealStages[dealStages.length - 1].id;
          counts.openDeals = deals?.filter(d => d.stage_id !== closedStageId).length || 0;
        } else {
          counts.openDeals = deals?.length || 0;
        }
        
        // Calculate total deals value
        let totalDealsValue = 0;
        deals?.forEach(deal => {
          if (deal.value && !isNaN(deal.value)) {
            totalDealsValue += Number(deal.value);
          }
        });
        counts.totalDealsValue = totalDealsValue;
        
        // Fetch hours logged this week
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Client dashboard (original dashboard for clients)
  return (
    <div className="space-y-6 p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('Dashboard')}
        </h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Welcome Card */}
      <Card className="bg-white overflow-hidden">
        <div className="md:flex">
          <div className="p-6 flex-1">
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {profile?.first_name}
            </h2>
            <p className="text-gray-600">
              {isAdmin && "You have administrator access to the portal. Here's a snapshot of your organization's performance."}
              {isEmployee && "You have employee access to the portal. Here's a summary of current activities."}
              {isClient && "You have client access to the portal. Here's an overview of your projects."}
            </p>
          </div>
          <div className="bg-primary/5 p-6 flex items-center justify-center md:w-1/3 lg:w-1/4">
            <div className="text-center">
              <p className="text-sm font-medium text-primary">Hours Logged This Week</p>
              <h3 className="text-3xl font-bold mt-1">
                {isLoading ? '...' : dashboardData?.hoursLogged || 0}
              </h3>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Overview Key Metrics */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* Tasks Overview */}
            <Card className="bg-white hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-primary" />
                  {t('Tasks')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <TasksSummary 
                    active={dashboardData?.activeTasks || 0} 
                    completed={dashboardData?.completedTasks || 0} 
                    overdue={dashboardData?.overdueTasks || 0} 
                    isLoading={isLoading} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Campaigns Overview */}
            <Card className="bg-white hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <ChartBarIcon className="mr-2 h-5 w-5 text-primary" />
                  {t('Campaigns')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <CampaignsSummary 
                    active={dashboardData?.activeCampaigns || 0} 
                    ready={dashboardData?.readyCampaigns || 0} 
                    inProgress={dashboardData?.inProgressCampaigns || 0} 
                    isLoading={isLoading} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Companies Overview */}
            <Card className="bg-white hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <CircleDollarSignIcon className="mr-2 h-5 w-5 text-primary" />
                  {t('MRR')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="text-3xl font-bold text-primary">
                    kr {isLoading ? '...' : (dashboardData?.totalMrr || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Monthly Recurring Revenue
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deals Overview */}
            <Card className="bg-white hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 text-primary" />
                  {t('Deals')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <DealsSummary 
                    total={dashboardData?.totalDeals || 0} 
                    open={dashboardData?.openDeals || 0} 
                    value={dashboardData?.totalDealsValue || 0} 
                    isLoading={isLoading} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Companies Breakdown</CardTitle>
                <CardDescription>Marketing vs Web Client Distribution</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <CompaniesSummary 
                  total={dashboardData?.totalCompanies || 0}
                  marketing={dashboardData?.marketingCompanies || 0}
                  web={dashboardData?.webCompanies || 0}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>MRR Trends</CardTitle>
                <CardDescription>Monthly recurring revenue over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <MrrChart isLoading={isLoading} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <DashboardCharts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
