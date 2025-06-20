
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
    console.log('Real-time project assignee change detected:', payload);
    
    // Invalidate project assignee queries
    queryClient.invalidateQueries({ queryKey: ['project-assignees'] });
    queryClient.invalidateQueries({ queryKey: ['user-project-assignments'] });
    
    // Get the project ID from the changed assignee
    const changedProjectId = payload.new?.project_id || payload.old?.project_id;
    
    // Invalidate specific project data
    if (changedProjectId) {
      queryClient.invalidateQueries({ queryKey: ['project', changedProjectId] });
      queryClient.invalidateQueries({ queryKey: ['project-assignees', changedProjectId] });
    }
    
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-assignees', projectId] });
    }
    
    // Invalidate all project assignee queries to ensure cross-project updates
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'project-assignees' ||
               query.queryKey[0] === 'user-project-assignments';
      }
    });

    console.log('Project assignee queries invalidated');
  };

  // Listen to all assignee changes to catch updates from any source
  const filter = undefined; // Remove project-specific filter

  useRealtime({
    table: 'project_assignees',
    filter,
    onInsert: handleAssigneeChange,
    onUpdate: handleAssigneeChange,
    onDelete: handleAssigneeChange,
    enabled
  });
};
