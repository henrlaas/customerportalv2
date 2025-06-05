
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task, Campaign, Project } from '@/types/timeTracking';

// Hook to fetch tasks for a specific company
export const useCompanyTasks = (companyId: string | null | undefined) => {
  return useQuery({
    queryKey: ['companyTasks', companyId],
    queryFn: async () => {
      if (!companyId || companyId === 'no-company') return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title')
        .eq('company_id', companyId)
        .order('title');
        
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!companyId && companyId !== 'no-company',
  });
};

// Hook to fetch campaigns for a specific company
export const useCompanyCampaigns = (companyId: string | null | undefined) => {
  return useQuery({
    queryKey: ['companyCampaigns', companyId],
    queryFn: async () => {
      if (!companyId || companyId === 'no-company') return [];
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, company_id')
        .eq('company_id', companyId)
        .order('name');
        
      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!companyId && companyId !== 'no-company',
  });
};

// Hook to fetch projects for a specific company
export const useCompanyProjects = (companyId: string | null | undefined) => {
  return useQuery({
    queryKey: ['companyProjects', companyId],
    queryFn: async () => {
      if (!companyId || companyId === 'no-company') return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, company_id')
        .eq('company_id', companyId)
        .order('name');
        
      if (error) throw error;
      return data as Project[];
    },
    enabled: !!companyId && companyId !== 'no-company',
  });
};
