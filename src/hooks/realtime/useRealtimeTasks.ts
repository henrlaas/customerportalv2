
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

  const handleTaskChange = (payload: any) => {
    console.log('🔄 Task real-time event received:', payload);
    
    // Invalidate all task-related queries to ensure comprehensive updates
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['user-task-stats'] });
    queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
    
    // Invalidate specific task if provided
    if (taskId) {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      console.log('🔄 Invalidated specific task:', taskId);
    }
    
    // Invalidate project-specific tasks (critical for ProjectDetailsPage)
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
      console.log('🔄 Invalidated project tasks for:', projectId);
    }
    
    // Invalidate based on the actual task data from the payload
    if (payload?.new?.project_id) {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', payload.new.project_id] });
      console.log('🔄 Invalidated project tasks from payload:', payload.new.project_id);
    }
    
    // Broad invalidation to catch all project task queries
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const isProjectTaskQuery = query.queryKey[0] === 'project-tasks';
        if (isProjectTaskQuery) {
          console.log('🔄 Invalidating project-tasks query:', query.queryKey);
        }
        return isProjectTaskQuery;
      }
    });
    
    console.log('✅ Task real-time invalidation complete');
  };

  // Use minimal filtering - only filter by specific task if provided
  // This ensures we catch tasks created from any page or by any user
  let filter: string | undefined;
  if (taskId) {
    filter = `id=eq.${taskId}`;
  }
  // No projectId filtering here - we want to catch all tasks and filter in the handler
  
  console.log('🔊 Setting up task real-time listener with filter:', filter);

  useRealtime({
    table: 'tasks',
    filter,
    onInsert: handleTaskChange,
    onUpdate: handleTaskChange,
    onDelete: handleTaskChange,
    enabled
  });
};
