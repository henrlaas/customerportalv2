
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../useRealtime';

interface UseRealtimeTasksOptions {
  taskId?: string;
  projectId?: string;
  enabled?: boolean;
}

export const useRealtimeTasks = ({
  taskId,
  projectId,
  enabled = true
}: UseRealtimeTasksOptions = {}) => {
  const queryClient = useQueryClient();

  const handleTaskChange = () => {
    // Invalidate task-related queries
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['user-task-stats'] });
    queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
    
    if (taskId) {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    }
    
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
    }
  };

  // Create filter for both taskId and projectId
  let filter: string | undefined;
  if (taskId && projectId) {
    filter = `id=eq.${taskId},project_id=eq.${projectId}`;
  } else if (taskId) {
    filter = `id=eq.${taskId}`;
  } else if (projectId) {
    filter = `project_id=eq.${projectId}`;
  }

  useRealtime({
    table: 'tasks',
    filter,
    onInsert: handleTaskChange,
    onUpdate: handleTaskChange,
    onDelete: handleTaskChange,
    enabled
  });
};
