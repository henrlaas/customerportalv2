
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

  const handleTimeEntryChange = () => {
    // Invalidate all time entry related queries
    queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    queryClient.invalidateQueries({ queryKey: ['project-time-entries'] });
    queryClient.invalidateQueries({ queryKey: ['project-time-entries-enhanced'] });
    queryClient.invalidateQueries({ queryKey: ['monthlyHours'] });
    
    // Invalidate project-specific time entries (used by ProjectDetailsPage and overview cards)
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project-time-entries-enhanced', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-time-entries', projectId] });
    }
    
    // Invalidate task-specific time entries
    if (taskId) {
      queryClient.invalidateQueries({ queryKey: ['time-entries', taskId] });
    }
    
    // Invalidate all project time entries to ensure overview cards update
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'project-time-entries-enhanced' || 
               query.queryKey[0] === 'project-time-entries';
      }
    });
  };

  // Create filter based on provided options, but allow broader listening
  let filter: string | undefined;
  if (projectId && taskId) {
    filter = `project_id=eq.${projectId},task_id=eq.${taskId}`;
  } else if (projectId) {
    filter = `project_id=eq.${projectId}`;
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
