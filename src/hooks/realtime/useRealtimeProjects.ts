
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../useRealtime';

interface UseRealtimeProjectsOptions {
  projectId?: string;
  enabled?: boolean;
}

export const useRealtimeProjects = ({
  projectId,
  enabled = true
}: UseRealtimeProjectsOptions = {}) => {
  const queryClient = useQueryClient();

  const handleProjectChange = () => {
    // Invalidate project-related queries
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    }
  };

  const filter = projectId ? `id=eq.${projectId}` : undefined;

  useRealtime({
    table: 'projects',
    filter,
    onInsert: handleProjectChange,
    onUpdate: handleProjectChange,
    onDelete: handleProjectChange,
    enabled
  });
};
