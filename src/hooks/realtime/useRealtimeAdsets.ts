
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../useRealtime';

interface UseRealtimeAdsetsOptions {
  campaignId?: string;
  enabled?: boolean;
}

export const useRealtimeAdsets = ({
  campaignId,
  enabled = true
}: UseRealtimeAdsetsOptions = {}) => {
  const queryClient = useQueryClient();

  const handleAdsetChange = () => {
    // Invalidate adset-related queries
    queryClient.invalidateQueries({ queryKey: ['adsets'] });
    
    if (campaignId) {
      queryClient.invalidateQueries({ queryKey: ['adsets', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
    }
  };

  const filter = campaignId ? `campaign_id=eq.${campaignId}` : undefined;

  useRealtime({
    table: 'adsets',
    filter,
    onInsert: handleAdsetChange,
    onUpdate: handleAdsetChange,
    onDelete: handleAdsetChange,
    enabled
  });
};
