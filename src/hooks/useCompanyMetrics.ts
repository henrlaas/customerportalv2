
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyMetrics {
  // Project metrics
  totalProjects: number;
  completedProjects: number;
  completedProjectsValue: number;
  overdueProjects: number;
  
  // Contract metrics
  totalContracts: number;
  unsignedContracts: number;
  
  // Task metrics
  totalTasks: number;
  uncompletedTasks: number;
  completedTasks: number;
  
  // Deal metrics
  totalDeals: number;
  totalDealsValue: number;
  
  // Time tracking metrics
  totalHoursThisMonth: number;
  invoiceableHoursThisMonth: number;
}

export const useCompanyMetrics = (companyId: string) => {
  return useQuery({
    queryKey: ['company-metrics', companyId],
    queryFn: async (): Promise<CompanyMetrics> => {
      if (!companyId) {
        throw new Error('Company ID is required');
      }

      console.log('Fetching company metrics for:', companyId);

      // Get current month date range
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Fetch projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, value, deadline')
        .eq('company_id', companyId);

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      }

      // Fetch contracts
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('id, status')
        .eq('company_id', companyId);

      if (contractsError) {
        console.error('Error fetching contracts:', contractsError);
      }

      // Fetch tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, status')
        .eq('company_id', companyId);

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      }

      // Fetch deals
      const { data: deals, error: dealsError } = await supabase
        .from('deals')
        .select('id, value')
        .eq('company_id', companyId);

      if (dealsError) {
        console.error('Error fetching deals:', dealsError);
      }

      // Fetch time entries for this month
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('start_time, end_time, is_billable, user_id')
        .eq('company_id', companyId)
        .gte('start_time', startOfMonth.toISOString())
        .lte('start_time', endOfMonth.toISOString());

      if (timeError) {
        console.error('Error fetching time entries:', timeError);
      }

      // Fetch project time entries for this month
      const { data: projectTimeEntries, error: projectTimeError } = await supabase
        .from('time_entries')
        .select('start_time, end_time, is_billable, user_id, project_id')
        .not('project_id', 'is', null)
        .gte('start_time', startOfMonth.toISOString())
        .lte('start_time', endOfMonth.toISOString());

      if (projectTimeError) {
        console.error('Error fetching project time entries:', projectTimeError);
      }

      // Filter project time entries that belong to this company
      const companyProjectIds = projects?.map(p => p.id) || [];
      const filteredProjectTimeEntries = projectTimeEntries?.filter(entry => 
        companyProjectIds.includes(entry.project_id)
      ) || [];

      // Fetch task time entries for this month
      const { data: taskTimeEntries, error: taskTimeError } = await supabase
        .from('time_entries')
        .select('start_time, end_time, is_billable, user_id, task_id')
        .not('task_id', 'is', null)
        .gte('start_time', startOfMonth.toISOString())
        .lte('start_time', endOfMonth.toISOString());

      if (taskTimeError) {
        console.error('Error fetching task time entries:', taskTimeError);
      }

      // Filter task time entries that belong to this company
      const companyTaskIds = tasks?.map(t => t.id) || [];
      const filteredTaskTimeEntries = taskTimeEntries?.filter(entry => 
        companyTaskIds.includes(entry.task_id)
      ) || [];

      // Get workspace hourly rate setting
      const { data: workspaceSettings } = await supabase
        .from('workspace_settings')
        .select('setting_value')
        .eq('setting_key', 'hourly_rate_employee')
        .maybeSingle();

      const defaultHourlyRate = workspaceSettings?.setting_value ? parseFloat(workspaceSettings.setting_value) : 0;

      // Calculate metrics
      const totalProjects = projects?.length || 0;
      
      // For now, consider projects completed if they have a deadline in the past
      // This can be enhanced later with actual completion status
      const completedProjects = projects?.filter(p => 
        p.deadline && new Date(p.deadline) < now
      ).length || 0;
      
      const completedProjectsValue = projects?.filter(p => 
        p.deadline && new Date(p.deadline) < now
      ).reduce((sum, p) => sum + (p.value || 0), 0) || 0;
      
      const overdueProjects = projects?.filter(p => 
        p.deadline && new Date(p.deadline) < now
      ).length || 0;

      const totalContracts = contracts?.length || 0;
      const unsignedContracts = contracts?.filter(c => c.status === 'unsigned').length || 0;

      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
      const uncompletedTasks = totalTasks - completedTasks;

      const totalDeals = deals?.length || 0;
      const totalDealsValue = deals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0;

      // Combine all time entries for this company
      const allTimeEntries = [
        ...(timeEntries || []),
        ...filteredProjectTimeEntries,
        ...filteredTaskTimeEntries
      ];

      // Calculate total hours
      const totalHoursThisMonth = allTimeEntries.reduce((total, entry) => {
        if (entry.end_time) {
          const hours = (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / (1000 * 60 * 60);
          return total + hours;
        }
        return total;
      }, 0);

      // Calculate invoiceable hours (billable hours * hourly rate)
      const billableHours = allTimeEntries.reduce((total, entry) => {
        if (entry.is_billable && entry.end_time) {
          const hours = (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / (1000 * 60 * 60);
          return total + hours;
        }
        return total;
      }, 0);

      const invoiceableHoursThisMonth = billableHours * defaultHourlyRate;

      console.log('Company metrics calculated:', {
        totalProjects,
        completedProjects,
        completedProjectsValue,
        overdueProjects,
        totalContracts,
        unsignedContracts,
        totalTasks,
        uncompletedTasks,
        completedTasks,
        totalDeals,
        totalDealsValue,
        totalHoursThisMonth,
        invoiceableHoursThisMonth
      });

      return {
        totalProjects,
        completedProjects,
        completedProjectsValue,
        overdueProjects,
        totalContracts,
        unsignedContracts,
        totalTasks,
        uncompletedTasks,
        completedTasks,
        totalDeals,
        totalDealsValue,
        totalHoursThisMonth,
        invoiceableHoursThisMonth
      };
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
