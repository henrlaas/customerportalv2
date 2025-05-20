
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MilestoneStatus } from './useProjectMilestones';

interface CompleteMilestoneParams {
  milestoneId: string;
  status: MilestoneStatus;
}

export const useCompleteMilestone = () => {
  const queryClient = useQueryClient();
  
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ milestoneId, status }: CompleteMilestoneParams) => {
      const { data, error } = await supabase
        .from('milestones')
        .update({ status: status })
        .eq('id', milestoneId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating milestone status:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Invalidate the project-milestones query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['project-milestones', data.project_id] });
    }
  });
  
  return {
    completeMilestone: mutateAsync,
    isLoading: isPending,
    error
  };
};
