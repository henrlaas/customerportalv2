
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
    
    // Invalidate all task-related queries
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['user-task-stats'] });
    queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
    
    // Invalidate specific task if we have an ID
    const changedTaskId = payload.new?.id || payload.old?.id;
    if (changedTaskId) {
      queryClient.invalidateQueries({ queryKey: ['task', changedTaskId] });
    }
    
    // Invalidate project-specific task queries
    const changedProjectId = payload.new?.project_id || payload.old?.project_id;
    if (changedProjectId) {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', changedProjectId] });
    }
    
    // Also invalidate the specific query keys used by ProjectDetailsPage
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
    }
    
    // Invalidate all project task queries to ensure overview cards update
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const key = query.queryKey[0];
        return key === 'project-tasks' || key === 'tasks' || key === 'user-task-stats';
      }
    });

    console.log('Task queries invalidated');
  };

  // Remove restrictive filters - listen to ALL task changes
  // This ensures tasks created from any page (Tasks page, Project Details page) are caught
  let filter: string | undefined;
  
  // Only apply specific filters if we're monitoring a specific task or project
  // For ProjectDetailsPage, we want to catch ALL changes to update overview cards
  if (taskId && projectId) {
    filter = `id=eq.${taskId},project_id=eq.${projectId}`;
  } else if (taskId) {
    filter = `id=eq.${taskId}`;
  } else if (projectId) {
    // For project pages, still listen to project-specific changes but also catch global updates
    // We'll filter in the handler instead
    filter = undefined; // Listen to all changes
  }
  // If no specific filters, listen to all task changes

  useRealtime({
    table: 'tasks',
    filter,
    onInsert: handleTaskChange,
    onUpdate: handleTaskChange,
    onDelete: handleTaskChange,
    enabled
  });
};
