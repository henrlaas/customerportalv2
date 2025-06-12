
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCompleteMilestone = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (milestoneId: string) => {
      const { data, error } = await supabase
        .from('milestones')
        .update({ status: 'completed' })
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
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error
  };
};
