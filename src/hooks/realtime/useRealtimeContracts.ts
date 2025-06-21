
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '@/hooks/useRealtime';

interface UseRealtimeContractsOptions {
  enabled?: boolean;
  projectId?: string;
}

export const useRealtimeContracts = ({ enabled = true, projectId }: UseRealtimeContractsOptions = {}) => {
  const queryClient = useQueryClient();

  console.log('📄 useRealtimeContracts: Setting up real-time subscription, enabled:', enabled);

  useRealtime({
    table: 'contracts',
    enabled,
    onInsert: (payload) => {
      console.log('📄 useRealtimeContracts: Contract inserted:', payload.new);
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['project-contracts', projectId] });
      }
    },
    onUpdate: (payload) => {
      console.log('📄 useRealtimeContracts: Contract updated:', payload.new);
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract', payload.new.id] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['project-contracts', projectId] });
      }
    },
    onDelete: (payload) => {
      console.log('📄 useRealtimeContracts: Contract deleted:', payload.old);
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['project-contracts', projectId] });
      }
    },
  });
};
