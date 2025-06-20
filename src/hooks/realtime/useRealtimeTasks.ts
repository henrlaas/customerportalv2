
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
    // Invalidate all task-related queries
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['user-task-stats'] });
    queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
    
    // Invalidate specific task
    if (taskId) {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    }
    
    // Invalidate project-specific tasks (used by ProjectDetailsPage)
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
    }
    
    // Invalidate all project tasks to catch cross-project updates
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'project-tasks';
      }
    });
  };

  // Use broader filter or no filter to catch tasks created from other pages
  let filter: string | undefined;
  if (taskId && projectId) {
    filter = `id=eq.${taskId},project_id=eq.${projectId}`;
  } else if (taskId) {
    filter = `id=eq.${taskId}`;
  } else if (projectId) {
    filter = `project_id=eq.${projectId}`;
  }
  // If no specific filters, listen to all task changes to ensure cross-page updates work

  useRealtime({
    table: 'tasks',
    filter,
    onInsert: handleTaskChange,
    onUpdate: handleTaskChange,
    onDelete: handleTaskChange,
    enabled
  });
};
