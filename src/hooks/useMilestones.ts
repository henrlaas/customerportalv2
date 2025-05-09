
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Milestone, MilestoneStatus } from '@/types/project';
import { useToast } from '@/components/ui/use-toast';

export const useMilestones = (projectId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch milestones by project
  const {
    data: milestones,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId!)
        .order('created_at');

      if (error) throw error;
      return data as Milestone[];
    },
    enabled: !!projectId
  });

  // Create a new milestone
  const createMilestone = useMutation({
    mutationFn: async (milestone: { 
      project_id: string;
      name: string;
      status: MilestoneStatus;
      due_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('milestones')
        .insert(milestone)
        .select('*')
        .single();

      if (error) throw error;
      return data as Milestone;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
      toast({
        title: 'Milestone created',
        description: 'The milestone has been created successfully'
      });
    },
    onError: (error) => {
      console.error('Error creating milestone:', error);
      toast({
        title: 'Error creating milestone',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Update a milestone
  const updateMilestone = useMutation({
    mutationFn: async ({ id, ...milestone }: Partial<Milestone> & { id: string }) => {
      const { data, error } = await supabase
        .from('milestones')
        .update(milestone)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return data as Milestone;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
      toast({
        title: 'Milestone updated',
        description: 'The milestone has been updated successfully'
      });
    },
    onError: (error) => {
      console.error('Error updating milestone:', error);
      toast({
        title: 'Error updating milestone',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Delete a milestone
  const deleteMilestone = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
      toast({
        title: 'Milestone deleted',
        description: 'The milestone has been deleted successfully'
      });
    },
    onError: (error) => {
      console.error('Error deleting milestone:', error);
      toast({
        title: 'Error deleting milestone',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    milestones,
    isLoading,
    error,
    createMilestone,
    updateMilestone,
    deleteMilestone
  };
};
