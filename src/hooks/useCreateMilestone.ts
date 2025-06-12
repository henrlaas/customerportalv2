
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MilestoneStatus } from './useProjectMilestones';

export type CreateMilestoneParams = {
  projectId: string;
  name: string;
  dueDate?: string | null;
};

export const useCreateMilestone = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async ({ projectId, name, dueDate }: CreateMilestoneParams) => {
      const { data, error } = await supabase
        .from('milestones')
        .insert({
          project_id: projectId,
          name,
          status: 'created' as MilestoneStatus,
          due_date: dueDate || null
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating milestone:', error);
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
