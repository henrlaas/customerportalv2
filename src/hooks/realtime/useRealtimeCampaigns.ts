
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../useRealtime';

interface UseRealtimeCampaignsOptions {
  campaignId?: string;
  enabled?: boolean;
}

export const useRealtimeCampaigns = ({
  campaignId,
  enabled = true
}: UseRealtimeCampaignsOptions = {}) => {
  const queryClient = useQueryClient();

  const handleCampaignChange = (payload: any) => {
    console.log('Real-time campaign change detected:', payload);
    
    const changedCampaignId = payload.new?.id || payload.old?.id;
    
    // Invalidate all campaign queries
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    
    // CRITICAL: Invalidate calendar-specific queries for campaign changes
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'calendar-campaigns';
      }
    });
    
    // Invalidate specific campaign if we have an ID
    if (changedCampaignId) {
      queryClient.invalidateQueries({ queryKey: ['campaign', changedCampaignId] });
    }
    
    if (campaignId) {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
    }
    
    // Broad invalidation for campaign-related queries
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const key = query.queryKey[0];
        return key === 'campaigns' || 
               key === 'calendar-campaigns' ||
               key === 'user-campaigns';
      }
    });

    console.log('Campaign queries invalidated successfully, including calendar queries');
  };

  const filter = campaignId ? `id=eq.${campaignId}` : undefined;

  useRealtime({
    table: 'campaigns',
    filter,
    onInsert: handleCampaignChange,
    onUpdate: handleCampaignChange,
    onDelete: handleCampaignChange,
    enabled
  });
};
