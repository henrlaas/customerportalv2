
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { differenceInDays } from 'date-fns';
import { Deal, Stage } from './types/deal';

/**
 * Component that manages automatic cleanup of deals that have been in "Closed Won" or
 * "Closed Lost" stages for a specified number of days:
 * - Closed Won: deleted after 5 days
 * - Closed Lost: deleted after 3 days
 */
export const DealCleanupHandler: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch stages to identify the "Closed Won" and "Closed Lost" stages by name
  const { data: stages = [] } = useQuery({
    queryKey: ['deal_stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deal_stages')
        .select('id, name')
        .order('position');
      
      if (error) {
        console.error('Error fetching stages:', error);
        return [];
      }
      
      return data;
    },
  });

  // Get the IDs of closed stages
  const closedWonStageId = stages.find(stage => stage.name.toLowerCase() === 'closed won')?.id;
  const closedLostStageId = stages.find(stage => stage.name.toLowerCase() === 'closed lost')?.id;

  // Mutation for deleting deals
  const deleteDealMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      console.log(`Deal ${id} has been automatically deleted as it was in a closed stage for the specified period.`);
    },
    onError: (error: any) => {
      toast({
        title: 'Auto-cleanup error',
        description: `Failed to delete outdated deal: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Fetch all deals that are in closed stages
  const { data: closedDeals = [] } = useQuery({
    queryKey: ['closed_deals', closedWonStageId, closedLostStageId],
    queryFn: async () => {
      if (!closedWonStageId && !closedLostStageId) {
        return [];
      }

      const stageIds = [closedWonStageId, closedLostStageId].filter(Boolean);
      
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .in('stage_id', stageIds);

      if (error) {
        console.error('Error fetching closed deals:', error);
        return [];
      }

      return data;
    },
    enabled: !!(closedWonStageId || closedLostStageId),
  });

  // Check and cleanup deals that have been in closed stages for too long
  useEffect(() => {
    if (!closedDeals.length || !stages.length) return;

    const now = new Date();
    const dealsToDelete: string[] = [];

    closedDeals.forEach((deal) => {
      const updatedAt = new Date(deal.updated_at);
      const daysSinceUpdate = differenceInDays(now, updatedAt);

      if (deal.stage_id === closedWonStageId && daysSinceUpdate >= 5) {
        dealsToDelete.push(deal.id);
      } else if (deal.stage_id === closedLostStageId && daysSinceUpdate >= 3) {
        dealsToDelete.push(deal.id);
      }
    });

    // Delete eligible deals
    if (dealsToDelete.length > 0) {
      dealsToDelete.forEach(id => {
        deleteDealMutation.mutate(id);
      });
    }
  }, [closedDeals, closedWonStageId, closedLostStageId, stages]);

  // This is a utility component that doesn't render anything
  return null;
};
