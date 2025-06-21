
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../useRealtime';
import { useAuth } from '@/contexts/AuthContext';

interface UseRealtimeTimeEntriesOptions {
  projectId?: string;
  taskId?: string;
  enabled?: boolean;
}

export const useRealtimeTimeEntries = ({
  projectId,
  taskId,
  enabled = true
}: UseRealtimeTimeEntriesOptions = {}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleTimeEntryChange = (payload: any) => {
    console.log('Real-time time entry change detected:', payload);
    
    // Get the changed entry's associations
    const changedProjectId = payload.new?.project_id || payload.old?.project_id;
    const changedTaskId = payload.new?.task_id || payload.old?.task_id;
    const changedUserId = payload.new?.user_id || payload.old?.user_id;
    const entryId = payload.new?.id || payload.old?.id;
    
    console.log('Changed entry - Project ID:', changedProjectId, 'Task ID:', changedTaskId, 'User ID:', changedUserId, 'Entry ID:', entryId);
    
    // Always invalidate general time entry queries
    queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    queryClient.invalidateQueries({ queryKey: ['monthlyHours'] });
    queryClient.invalidateQueries({ queryKey: ['monthly-time-entries'] });
    
    // CRITICAL: Invalidate user-specific time stats for dashboard updates
    if (changedUserId) {
      console.log('Invalidating user time stats for user:', changedUserId);
      queryClient.invalidateQueries({ queryKey: ['user-time-stats', changedUserId] });
      
      // Also invalidate for current user if they're viewing dashboard
      if (user?.id && user.id === changedUserId) {
        console.log('Invalidating current user dashboard stats');
        queryClient.invalidateQueries({ queryKey: ['user-time-stats', user.id] });
      }
    }
    
    // CRITICAL: Always invalidate project-specific queries when time entry has project_id
    // This ensures time entries created from /time-tracking page appear instantly in ProjectDetailsPage
    if (changedProjectId) {
      console.log('Invalidating project-specific time queries for project:', changedProjectId);
      queryClient.invalidateQueries({ queryKey: ['project-time-entries-enhanced', changedProjectId] });
      queryClient.invalidateQueries({ queryKey: ['project-time-entries', changedProjectId] });
    }
    
    // ALSO handle time entries associated with tasks that belong to projects
    // This is important for task-related time entries that should update project views
    if (changedTaskId) {
      console.log('Time entry associated with task:', changedTaskId, '- checking for project association');
      queryClient.invalidateQueries({ queryKey: ['time-entries', changedTaskId] });
      
      // We need to invalidate project queries in case this task belongs to a project
      // The task might have a project_id that we need to refresh
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          return query.queryKey[0] === 'project-time-entries-enhanced';
        }
      });
    }
    
    // Also invalidate for the current project being viewed (if specified)
    if (projectId && projectId !== changedProjectId) {
      console.log('Also invalidating current project time queries:', projectId);
      queryClient.invalidateQueries({ queryKey: ['project-time-entries-enhanced', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-time-entries', projectId] });
    }
    
    // Invalidate specific task time entries if monitoring specific task
    if (taskId) {
      queryClient.invalidateQueries({ queryKey: ['time-entries', taskId] });
    }
    
    // Broad invalidation to ensure all time entry related views update
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const key = query.queryKey[0];
        return key === 'project-time-entries-enhanced' || 
               key === 'project-time-entries' ||
               key === 'time-entries' ||
               key === 'monthlyHours' ||
               key === 'monthly-time-entries' ||
               key === 'user-time-stats';
      }
    });

    console.log('Time entry queries invalidated successfully');
  };

  // REMOVE RESTRICTIVE FILTERS - Listen to ALL time entry changes
  // This is crucial for catching time entries created from any page
  const filter = undefined; // No filtering - catch all time entry changes

  useRealtime({
    table: 'time_entries',
    filter,
    onInsert: handleTimeEntryChange,
    onUpdate: handleTimeEntryChange,
    onDelete: handleTimeEntryChange,
    enabled
  });
};
