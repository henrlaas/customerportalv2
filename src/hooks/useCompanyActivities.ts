
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyActivity {
  id: string;
  type: 'task' | 'project' | 'contract';
  title: string;
  status?: string;
  created_at: string;
  company_id: string;
}

export const useCompanyActivities = (companyId: string) => {
  return useQuery({
    queryKey: ['company-activities', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      console.log('Fetching activities for company:', companyId);
      
      // Fetch recent tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, title, status, created_at, company_id')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      }

      // Fetch recent projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, created_at, company_id')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      }

      // Fetch recent contracts
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('id, title, status, created_at, company_id')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (contractsError) {
        console.error('Error fetching contracts:', contractsError);
      }

      // Combine all activities
      const activities: CompanyActivity[] = [];

      // Add tasks
      if (tasks) {
        tasks.forEach(task => {
          activities.push({
            id: task.id,
            type: 'task',
            title: task.title,
            status: task.status,
            created_at: task.created_at,
            company_id: task.company_id
          });
        });
      }

      // Add projects
      if (projects) {
        projects.forEach(project => {
          activities.push({
            id: project.id,
            type: 'project',
            title: project.name,
            status: 'active', // Projects don't have status, so we'll show as active
            created_at: project.created_at,
            company_id: project.company_id
          });
        });
      }

      // Add contracts
      if (contracts) {
        contracts.forEach(contract => {
          activities.push({
            id: contract.id,
            type: 'contract',
            title: contract.title,
            status: contract.status,
            created_at: contract.created_at,
            company_id: contract.company_id
          });
        });
      }

      // Sort by created_at (newest first) and take top 3
      const sortedActivities = activities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);

      console.log('Company activities found:', sortedActivities);
      return sortedActivities;
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
