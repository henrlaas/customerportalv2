
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../useRealtime';

interface UseRealtimeTasksOptions {
  taskId?: string;
  enabled?: boolean;
}

export const useRealtimeTasks = ({
  taskId,
  enabled = true
}: UseRealtimeTasksOptions = {}) => {
  const queryClient = useQueryClient();

  const handleTaskChange = () => {
    // Invalidate task-related queries
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['user-task-stats'] });
    
    if (taskId) {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    }
  };

  const filter = taskId ? `id=eq.${taskId}` : undefined;

  useRealtime({
    table: 'tasks',
    filter,
    onInsert: handleTaskChange,
    onUpdate: handleTaskChange,
    onDelete: handleTaskChange,
    enabled
  });
};
