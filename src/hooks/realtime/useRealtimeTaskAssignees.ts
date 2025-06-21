
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../useRealtime';

interface UseRealtimeTaskAssigneesOptions {
  taskId?: string;
  enabled?: boolean;
}

export const useRealtimeTaskAssignees = ({
  taskId,
  enabled = true
}: UseRealtimeTaskAssigneesOptions = {}) => {
  const queryClient = useQueryClient();

  const handleAssigneeChange = (payload: any) => {
    console.log('Real-time task assignee change detected:', payload);
    
    const changedTaskId = payload.new?.task_id || payload.old?.task_id;
    const changedUserId = payload.new?.user_id || payload.old?.user_id;
    
    // Invalidate task assignee queries
    queryClient.invalidateQueries({ queryKey: ['task-assignees'] });
    queryClient.invalidateQueries({ queryKey: ['user-task-assignments'] });
    
    // Invalidate calendar queries for the affected user
    if (changedUserId) {
      queryClient.invalidateQueries({ queryKey: ['calendar-tasks', changedUserId] });
    }
    
    // Invalidate specific task data
    if (changedTaskId) {
      queryClient.invalidateQueries({ queryKey: ['task', changedTaskId] });
      queryClient.invalidateQueries({ queryKey: ['task-assignees', changedTaskId] });
    }
    
    if (taskId) {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task-assignees', taskId] });
    }
    
    // Broad invalidation for assignee-related queries
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'task-assignees' ||
               query.queryKey[0] === 'user-task-assignments' ||
               query.queryKey[0] === 'calendar-tasks';
      }
    });

    console.log('Task assignee queries invalidated');
  };

  const filter = undefined; // Listen to all changes to catch cross-task updates

  useRealtime({
    table: 'task_assignees',
    filter,
    onInsert: handleAssigneeChange,
    onUpdate: handleAssigneeChange,
    onDelete: handleAssigneeChange,
    enabled
  });
};
