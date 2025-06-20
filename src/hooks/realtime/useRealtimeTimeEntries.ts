
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../useRealtime';

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

  const handleTimeEntryChange = (payload: any) => {
    console.log('Real-time time entry change detected:', payload);
    
    // Invalidate all time entry related queries
    queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    queryClient.invalidateQueries({ queryKey: ['project-time-entries'] });
    queryClient.invalidateQueries({ queryKey: ['project-time-entries-enhanced'] });
    queryClient.invalidateQueries({ queryKey: ['monthlyHours'] });
    queryClient.invalidateQueries({ queryKey: ['monthly-time-entries'] });
    
    // Get the project ID from the changed entry
    const changedProjectId = payload.new?.project_id || payload.old?.project_id;
    const changedTaskId = payload.new?.task_id || payload.old?.task_id;
    
    // Invalidate project-specific time entries (used by ProjectDetailsPage and overview cards)
    if (changedProjectId) {
      queryClient.invalidateQueries({ queryKey: ['project-time-entries-enhanced', changedProjectId] });
      queryClient.invalidateQueries({ queryKey: ['project-time-entries', changedProjectId] });
    }
    
    // Invalidate current project if specified
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project-time-entries-enhanced', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-time-entries', projectId] });
    }
    
    // Invalidate task-specific time entries
    if (changedTaskId) {
      queryClient.invalidateQueries({ queryKey: ['time-entries', changedTaskId] });
    }
    if (taskId) {
      queryClient.invalidateQueries({ queryKey: ['time-entries', taskId] });
    }
    
    // Invalidate all project time entries to ensure overview cards and summary data update
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const key = query.queryKey[0];
        return key === 'project-time-entries-enhanced' || 
               key === 'project-time-entries' ||
               key === 'time-entries' ||
               key === 'monthlyHours' ||
               key === 'monthly-time-entries';
      }
    });

    console.log('Time entry queries invalidated');
  };

  // Remove restrictive filters - listen to ALL time entry changes
  // This ensures time entries created from any page are caught instantly
  let filter: string | undefined;
  
  if (projectId && taskId) {
    filter = `project_id=eq.${projectId},task_id=eq.${taskId}`;
  } else if (projectId) {
    // For project pages, listen to all changes to catch entries created elsewhere
    filter = undefined; // Listen to all changes
  } else if (taskId) {
    filter = `task_id=eq.${taskId}`;
  }
  // If no specific filters, listen to all time entry changes

  useRealtime({
    table: 'time_entries',
    filter,
    onInsert: handleTimeEntryChange,
    onUpdate: handleTimeEntryChange,
    onDelete: handleTimeEntryChange,
    enabled
  });
};
