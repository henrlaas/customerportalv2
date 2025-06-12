
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MilestoneStatus } from './useProjectMilestones';

type CreateMilestoneParams = {
  projectId: string;
  name: string;
  status: MilestoneStatus;
  dueDate?: string;
};

export const useCreateMilestone = () => {
  const queryClient = useQueryClient();
  
  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async ({ projectId, name, status, dueDate }: CreateMilestoneParams) => {
      const { data, error } = await supabase
        .from('milestones')
        .insert({
          project_id: projectId,
          name,
          status,
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
    createMilestone: mutateAsync,
    isLoading: isPending,
    error
  };
};
