
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
    console.log('🔄 Time entry real-time event received:', payload);
    
    // Invalidate all time entry related queries for comprehensive updates
    queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    queryClient.invalidateQueries({ queryKey: ['project-time-entries'] });
    queryClient.invalidateQueries({ queryKey: ['project-time-entries-enhanced'] });
    queryClient.invalidateQueries({ queryKey: ['monthlyHours'] });
    
    // Invalidate project-specific time entries if we have a projectId
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project-time-entries-enhanced', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-time-entries', projectId] });
      console.log('🔄 Invalidated project time entries for:', projectId);
    }
    
    // Invalidate based on the actual time entry data from the payload
    if (payload?.new?.project_id) {
      queryClient.invalidateQueries({ queryKey: ['project-time-entries-enhanced', payload.new.project_id] });
      queryClient.invalidateQueries({ queryKey: ['project-time-entries', payload.new.project_id] });
      console.log('🔄 Invalidated project time entries from payload:', payload.new.project_id);
    }
    
    // Invalidate task-specific time entries
    if (taskId) {
      queryClient.invalidateQueries({ queryKey: ['time-entries', taskId] });
      console.log('🔄 Invalidated task time entries for:', taskId);
    }
    
    if (payload?.new?.task_id) {
      queryClient.invalidateQueries({ queryKey: ['time-entries', payload.new.task_id] });
      console.log('🔄 Invalidated task time entries from payload:', payload.new.task_id);
    }
    
    // Broad invalidation to ensure overview cards and project summaries update
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const isTimeEntryQuery = query.queryKey[0] === 'project-time-entries-enhanced' || 
                                query.queryKey[0] === 'project-time-entries' ||
                                query.queryKey[0] === 'monthlyHours';
        if (isTimeEntryQuery) {
          console.log('🔄 Invalidating time entry query:', query.queryKey);
        }
        return isTimeEntryQuery;
      }
    });
    
    console.log('✅ Time entry real-time invalidation complete');
  };

  // Use minimal filtering - only filter by specific task if provided
  // This ensures we catch time entries created from any page or by any user
  let filter: string | undefined;
  if (taskId) {
    filter = `task_id=eq.${taskId}`;
  }
  // No projectId filtering here - we want to catch all time entries and filter in the handler
  
  console.log('🔊 Setting up time entry real-time listener with filter:', filter);

  useRealtime({
    table: 'time_entries',
    filter,
    onInsert: handleTimeEntryChange,
    onUpdate: handleTimeEntryChange,
    onDelete: handleTimeEntryChange,
    enabled
  });
};
