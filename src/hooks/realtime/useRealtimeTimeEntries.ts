
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
    
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project-time-entries-enhanced', projectId] });
    }
    
    if (taskId) {
      queryClient.invalidateQueries({ queryKey: ['time-entries', taskId] });
    }
  };

  // Create filter based on provided options
  let filter;
  if (projectId) {
    filter = `project_id=eq.${projectId}`;
  } else if (taskId) {
    filter = `task_id=eq.${taskId}`;
  }

  useRealtime({
    table: 'time_entries',
    filter,
    onInsert: handleTimeEntryChange,
    onUpdate: handleTimeEntryChange,
    onDelete: handleTimeEntryChange,
    enabled
  });
};
