
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DeleteMilestoneParams {
  milestoneId: string;
}

export const useDeleteMilestone = () => {
  const queryClient = useQueryClient();
  
  const { mutateAsync, isPending: isLoading, error } = useMutation({
    mutationFn: async ({ milestoneId }: DeleteMilestoneParams) => {
      const { data, error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', milestoneId)
        .select()
        .single();
      
      if (error) {
        console.error('Error deleting milestone:', error);
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
    deleteMilestone: mutateAsync,
    isLoading,
    error
  };
};
