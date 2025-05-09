
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type MilestoneStatus = 'created' | 'completed';

export type Milestone = {
  id: string;
  project_id: string;
  name: string;
  status: MilestoneStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export const useProjectMilestones = (projectId: string | null) => {
  const { data: milestones = [], isLoading, error } = useQuery({
    queryKey: ['project-milestones', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching milestones:', error);
        throw error;
      }
      
      return data as Milestone[];
    },
    enabled: !!projectId
  });

  return {
    milestones,
    isLoading,
    error
  };
};
