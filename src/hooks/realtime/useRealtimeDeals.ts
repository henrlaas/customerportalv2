
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/hooks/useRealtime';

interface UseRealtimeDealsOptions {
  enabled?: boolean;
}

export const useRealtimeDeals = ({ enabled = true }: UseRealtimeDealsOptions = {}) => {
  const queryClient = useQueryClient();

  console.log('🔄 useRealtimeDeals: Setting up real-time subscription, enabled:', enabled);

  useRealtime({
    table: 'deals',
    enabled,
    onInsert: (payload) => {
      console.log('🔄 useRealtimeDeals: Deal inserted:', payload.new);
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
    onUpdate: (payload) => {
      console.log('🔄 useRealtimeDeals: Deal updated:', payload.new);
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
    onDelete: (payload) => {
      console.log('🔄 useRealtimeDeals: Deal deleted:', payload.old);
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
};
