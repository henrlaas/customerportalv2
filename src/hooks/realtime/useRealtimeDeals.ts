
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../useRealtime';

interface UseRealtimeDealsOptions {
  dealId?: string;
  enabled?: boolean;
}

export const useRealtimeDeals = ({
  dealId,
  enabled = true
}: UseRealtimeDealsOptions = {}) => {
  const queryClient = useQueryClient();

  const handleDealChange = () => {
    // Invalidate deal-related queries
    queryClient.invalidateQueries({ queryKey: ['deals'] });
    queryClient.invalidateQueries({ queryKey: ['user-deal-stats'] });
    
    if (dealId) {
      queryClient.invalidateQueries({ queryKey: ['deal', dealId] });
    }
  };

  const filter = dealId ? `id=eq.${dealId}` : undefined;

  useRealtime({
    table: 'deals',
    filter,
    onInsert: handleDealChange,
    onUpdate: handleDealChange,
    onDelete: handleDealChange,
    enabled
  });
};
