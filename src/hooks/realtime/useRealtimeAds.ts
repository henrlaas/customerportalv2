
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../useRealtime';

interface UseRealtimeAdsOptions {
  adsetId?: string;
  campaignId?: string;
  enabled?: boolean;
}

export const useRealtimeAds = ({
  adsetId,
  campaignId,
  enabled = true
}: UseRealtimeAdsOptions = {}) => {
  const queryClient = useQueryClient();

  const handleAdChange = () => {
    // Invalidate ad-related queries
    queryClient.invalidateQueries({ queryKey: ['ads'] });
    
    if (adsetId) {
      queryClient.invalidateQueries({ queryKey: ['ads', adsetId] });
    }
    
    if (campaignId) {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
    }
  };

  // Create filter based on provided options
  let filter;
  if (adsetId) {
    filter = `adset_id=eq.${adsetId}`;
  }

  useRealtime({
    table: 'ads',
    filter,
    onInsert: handleAdChange,
    onUpdate: handleAdChange,
    onDelete: handleAdChange,
    enabled
  });
};
