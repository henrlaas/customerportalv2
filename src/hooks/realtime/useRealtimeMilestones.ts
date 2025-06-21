
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
    
    // Get the project ID from the changed milestone
    const changedProjectId = payload.new?.project_id || payload.old?.project_id;
    
    // Invalidate milestone-related queries
    queryClient.invalidateQueries({ queryKey: ['milestones'] });
    queryClient.invalidateQueries({ queryKey: ['all-project-milestones'] });
    
    // CRITICAL: Invalidate calendar-specific queries that depend on milestones
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'project-milestones-user' ||
               query.queryKey[0] === 'calendar-projects';
      }
    });
    
    // Invalidate project-specific milestones
    if (changedProjectId) {
      queryClient.invalidateQueries({ queryKey: ['project-milestones', changedProjectId] });
    }
    
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] });
    }
    
    // CRITICAL: Invalidate the all-project-milestones query that's used by ProjectsPage
    // This needs to be done with the exact same query key pattern used in ProjectsPage
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        // Match the exact query key pattern from ProjectsPage
        return query.queryKey[0] === 'all-project-milestones';
      }
    });

    // Also invalidate any cached project milestones queries with project arrays
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'all-project-milestones' && Array.isArray(query.queryKey[1]);
      }
    });

    console.log('Milestone queries invalidated, including calendar and milestone queries');
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
