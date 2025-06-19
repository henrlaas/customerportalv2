
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

  const handleCampaignChange = () => {
    // Invalidate campaign-related queries
    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    
    if (campaignId) {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['adsets', campaignId] });
    }
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
