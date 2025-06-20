
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../useRealtime';

interface UseRealtimeProjectAssigneesOptions {
  projectId?: string;
  enabled?: boolean;
}

export const useRealtimeProjectAssignees = ({
  projectId,
  enabled = true
}: UseRealtimeProjectAssigneesOptions = {}) => {
  const queryClient = useQueryClient();

  const handleAssigneeChange = (payload: any) => {
    console.log('🔄 Project assignee real-time event received:', payload);
    
    // Invalidate project assignee queries
    queryClient.invalidateQueries({ queryKey: ['project-assignees'] });
    queryClient.invalidateQueries({ queryKey: ['user-project-assignments'] });
    
    // Invalidate specific project data
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-assignees', projectId] });
      console.log('🔄 Invalidated project assignees for:', projectId);
    }
    
    // Invalidate based on the actual assignee data from the payload  
    if (payload?.new?.project_id) {
      queryClient.invalidateQueries({ queryKey: ['project', payload.new.project_id] });
      queryClient.invalidateQueries({ queryKey: ['project-assignees', payload.new.project_id] });
      console.log('🔄 Invalidated project assignees from payload:', payload.new.project_id);
    }
    
    // Invalidate all project assignee queries to ensure cross-project updates
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const isAssigneeQuery = query.queryKey[0] === 'project-assignees';
        if (isAssigneeQuery) {
          console.log('🔄 Invalidating project assignee query:', query.queryKey);
        }
        return isAssigneeQuery;
      }
    });
    
    console.log('✅ Project assignee real-time invalidation complete');
  };

  // Use minimal filtering to catch assignee changes
  let filter: string | undefined;
  if (projectId) {
    filter = `project_id=eq.${projectId}`;
  }
  // If no projectId, listen to all assignee changes
  
  console.log('🔊 Setting up project assignee real-time listener with filter:', filter);

  useRealtime({
    table: 'project_assignees',
    filter,
    onInsert: handleAssigneeChange,
    onUpdate: handleAssigneeChange,
    onDelete: handleAssigneeChange,
    enabled
  });
};
