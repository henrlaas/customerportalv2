
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
    queryClient.invalidateQueries({ queryKey: ['milestones'] });
    queryClient.invalidateQueries({ queryKey: ['all-project-milestones'] });
    
    // Invalidate project-specific milestones
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] });
    }
    
    // Invalidate all project milestones to ensure cross-project updates work
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'project-milestones' || 
               query.queryKey[0] === 'all-project-milestones';
      }
    });
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
