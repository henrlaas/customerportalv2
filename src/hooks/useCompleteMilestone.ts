
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
      console.log('Milestone status updated, invalidating queries');
      
      // Invalidate the project-milestones query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['project-milestones', data.project_id] });
      
      // CRITICAL: Also invalidate the all-project-milestones query used by ProjectsPage
      queryClient.invalidateQueries({ queryKey: ['all-project-milestones'] });
      
      // Invalidate with predicate to catch all variations of the query
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          return query.queryKey[0] === 'all-project-milestones';
        }
      });
      
      console.log('All milestone-related queries invalidated');
    }
  });
  
  return {
    completeMilestone: mutateAsync,
    isLoading: isPending,
    error
  };
};
