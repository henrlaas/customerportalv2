
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
    
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    }
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
