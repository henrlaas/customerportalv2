
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

  const handleAssigneeChange = () => {
    // Invalidate project assignee queries
    queryClient.invalidateQueries({ queryKey: ['project-assignees'] });
    queryClient.invalidateQueries({ queryKey: ['user-project-assignments'] });
    
    // Invalidate specific project data
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-assignees', projectId] });
    }
    
    // Invalidate all project assignee queries to ensure cross-project updates
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'project-assignees';
      }
    });
  };

  const filter = projectId ? `project_id=eq.${projectId}` : undefined;

  useRealtime({
    table: 'project_assignees',
    filter,
    onInsert: handleAssigneeChange,
    onUpdate: handleAssigneeChange,
    onDelete: handleAssigneeChange,
    enabled
  });
};
