
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
    console.log('Real-time task change detected:', payload);
    
    // Get the changed task's project and task IDs
    const changedTaskId = payload.new?.id || payload.old?.id;
    const changedProjectId = payload.new?.project_id || payload.old?.project_id;
    
    console.log('Changed task ID:', changedTaskId, 'Changed project ID:', changedProjectId);
    
    // Always invalidate general task queries
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['user-task-stats'] });
    
    // CRITICAL: Invalidate calendar-specific queries for task changes
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'calendar-tasks';
      }
    });
    
    // Invalidate specific task if we have an ID
    if (changedTaskId) {
      queryClient.invalidateQueries({ queryKey: ['task', changedTaskId] });
    }
    
    // CRITICAL: Always invalidate project-specific task queries when a task has a project_id
    // This ensures tasks created from /tasks page appear instantly in ProjectDetailsPage
    if (changedProjectId) {
      console.log('Invalidating project-specific queries for project:', changedProjectId);
      queryClient.invalidateQueries({ queryKey: ['project-tasks', changedProjectId] });
      queryClient.invalidateQueries({ queryKey: ['project-time-entries-enhanced', changedProjectId] });
    }
    
    // Also invalidate for the current project being viewed (if specified)
    if (projectId && projectId !== changedProjectId) {
      console.log('Also invalidating current project queries:', projectId);
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
    }
    
    // Invalidate specific task query if monitoring specific task
    if (taskId) {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    }
    
    // Broad invalidation to ensure all task-related views update
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const key = query.queryKey[0];
        return key === 'project-tasks' || 
               key === 'tasks' || 
               key === 'user-task-stats' ||
               key === 'calendar-tasks' ||
               key === 'project-time-entries-enhanced'; // Task changes can affect time summaries
      }
    });

    console.log('Task queries invalidated successfully, including calendar queries');
  };

  // REMOVE RESTRICTIVE FILTERS - Listen to ALL task changes
  // This is crucial for catching tasks created from any page
  const filter = undefined; // No filtering - catch all task changes

  useRealtime({
    table: 'tasks',
    filter,
    onInsert: handleTaskChange,
    onUpdate: handleTaskChange,
    onDelete: handleTaskChange,
    enabled
  });
};
