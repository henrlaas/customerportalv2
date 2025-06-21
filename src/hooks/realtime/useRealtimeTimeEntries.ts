
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/hooks/useRealtime';

interface UseRealtimeTimeEntriesOptions {
  enabled?: boolean;
}

export const useRealtimeTimeEntries = ({ enabled = true }: UseRealtimeTimeEntriesOptions = {}) => {
  const queryClient = useQueryClient();

  console.log('⏰ useRealtimeTimeEntries: Setting up real-time subscription, enabled:', enabled);

  useRealtime({
    table: 'time_entries',
    enabled,
    onInsert: (payload) => {
      console.log('⏰ useRealtimeTimeEntries: Time entry inserted:', payload.new);
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyHours'] });
    },
    onUpdate: (payload) => {
      console.log('⏰ useRealtimeTimeEntries: Time entry updated:', payload.new);
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyHours'] });
    },
    onDelete: (payload) => {
      console.log('⏰ useRealtimeTimeEntries: Time entry deleted:', payload.old);
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyHours'] });
    },
  });
};
