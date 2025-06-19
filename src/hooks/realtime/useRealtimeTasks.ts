
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../useRealtime';

interface UseRealtimeTasksOptions {
  projectId?: string;
  enabled?: boolean;
}

export const useRealtimeTasks = ({
  projectId,
  enabled = true
}: UseRealtimeTasksOptions = {}) => {
  const queryClient = useQueryClient();

  const handleTaskChange = () => {
    // Invalidate task-related queries
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
    
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
    }
  };

  const filter = projectId ? `project_id=eq.${projectId}` : undefined;

  useRealtime({
    table: 'tasks',
    filter,
    onInsert: handleTaskChange,
    onUpdate: handleTaskChange,
    onDelete: handleTaskChange,
    enabled
  });
};
