
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../useRealtime';

interface UseRealtimeContractsOptions {
  projectId?: string;
  enabled?: boolean;
}

export const useRealtimeContracts = ({
  projectId,
  enabled = true
}: UseRealtimeContractsOptions = {}) => {
  const queryClient = useQueryClient();

  const handleContractChange = () => {
    // Invalidate contract-related queries
    queryClient.invalidateQueries({ queryKey: ['contracts'] });
    queryClient.invalidateQueries({ queryKey: ['project-contracts'] });
    
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project-contracts', projectId] });
    }
  };

  const filter = projectId ? `project_id=eq.${projectId}` : undefined;

  useRealtime({
    table: 'contracts',
    filter,
    onInsert: handleContractChange,
    onUpdate: handleContractChange,
    onDelete: handleContractChange,
    enabled
  });
};
