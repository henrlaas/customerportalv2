
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

  const handleMilestoneChange = (payload: any) => {
    console.log('Real-time milestone change detected:', payload);
    
    // Invalidate milestone-related queries
    queryClient.invalidateQueries({ queryKey: ['milestones'] });
    queryClient.invalidateQueries({ queryKey: ['all-project-milestones'] });
    
    // Get the project ID from the changed milestone
    const changedProjectId = payload.new?.project_id || payload.old?.project_id;
    
    // Invalidate project-specific milestones
    if (changedProjectId) {
      queryClient.invalidateQueries({ queryKey: ['project-milestones', changedProjectId] });
    }
    
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] });
    }
    
    // Invalidate all project milestones to ensure cross-project updates work
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'project-milestones' || 
               query.queryKey[0] === 'all-project-milestones' ||
               query.queryKey[0] === 'milestones';
      }
    });

    console.log('Milestone queries invalidated');
  };

  // Listen to all milestone changes to catch updates from any source
  const filter = undefined; // Remove project-specific filter to catch all changes

  useRealtime({
    table: 'milestones',
    filter,
    onInsert: handleMilestoneChange,
    onUpdate: handleMilestoneChange,
    onDelete: handleMilestoneChange,
    enabled
  });
};
