
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCompleteMilestone = () => {
  const queryClient = useQueryClient();
  
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (milestoneId: string) => {
      const { data, error } = await supabase
        .from('milestones')
        .update({ status: 'completed' })
        .eq('id', milestoneId)
        .select()
        .single();
      
      if (error) {
        console.error('Error completing milestone:', error);
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
