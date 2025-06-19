
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../useRealtime';

interface UseRealtimeMilestonesOptions {
  projectId?: string;
  enabled?: boolean;
}

export const useRealtimeMilestones = ({
  projectId,
  enabled = true
}: UseRealtimeMilestonesOptions = {}) => {
  const queryClient = useQueryClient();

  const handleMilestoneChange = () => {
    // Invalidate milestone-related queries
    queryClient.invalidateQueries({ queryKey: ['project-milestones'] });
    queryClient.invalidateQueries({ queryKey: ['milestones'] });
    
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] });
    }
  };

  const filter = projectId ? `project_id=eq.${projectId}` : undefined;

  useRealtime({
    table: 'milestones',
    filter,
    onInsert: handleMilestoneChange,
    onUpdate: handleMilestoneChange,
    onDelete: handleMilestoneChange,
    enabled
  });
};
