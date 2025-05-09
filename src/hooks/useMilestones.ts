
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Milestone, MilestoneStatus } from '@/types/project';

export const useMilestones = (projectId?: string) => {
  const queryClient = useQueryClient();

  const milestonesQuery = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async (): Promise<Milestone[]> => {
      let query = supabase
        .from('milestones')
        .select('*')
        .order('created_at');

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching milestones:', error);
        throw error;
      }

      return data;
    },
    enabled: !!projectId,
  });

  const createMilestoneMutation = useMutation({
    mutationFn: async (milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('milestones')
        .insert(milestone)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ 
      milestoneId, 
      data 
    }: { 
      milestoneId: string, 
      data: Partial<Milestone> 
    }) => {
      const { error } = await supabase
        .from('milestones')
        .update(data)
        .eq('id', milestoneId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
    },
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: async (milestoneId: string) => {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', milestoneId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
    },
  });

  const updateMilestoneStatus = (milestoneId: string, status: MilestoneStatus) => {
    updateMilestoneMutation.mutate({ milestoneId, data: { status } });
  };

  return {
    milestones: milestonesQuery.data || [],
    isLoading: milestonesQuery.isLoading,
    isError: milestonesQuery.isError,
    createMilestone: createMilestoneMutation.mutate,
    updateMilestone: updateMilestoneMutation.mutate,
    deleteMilestone: deleteMilestoneMutation.mutate,
    updateMilestoneStatus,
  };
};
