
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
    console.log('🔄 Milestone real-time event received:', payload);
    
    // Invalidate milestone-related queries
    queryClient.invalidateQueries({ queryKey: ['milestones'] });
    queryClient.invalidateQueries({ queryKey: ['all-project-milestones'] });
    
    // Invalidate project-specific milestones
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] });
      console.log('🔄 Invalidated project milestones for:', projectId);
    }
    
    // Invalidate based on the actual milestone data from the payload
    if (payload?.new?.project_id) {
      queryClient.invalidateQueries({ queryKey: ['project-milestones', payload.new.project_id] });
      console.log('🔄 Invalidated project milestones from payload:', payload.new.project_id);
    }
    
    // Invalidate all project milestones to ensure cross-project updates work
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const isMilestoneQuery = query.queryKey[0] === 'project-milestones' || 
                                query.queryKey[0] === 'all-project-milestones';
        if (isMilestoneQuery) {
          console.log('🔄 Invalidating milestone query:', query.queryKey);
        }
        return isMilestoneQuery;
      }
    });
    
    console.log('✅ Milestone real-time invalidation complete');
  };

  // Use minimal filtering to catch all milestone changes
  let filter: string | undefined;
  if (projectId) {
    filter = `project_id=eq.${projectId}`;
  }
  // If no projectId, listen to all milestone changes
  
  console.log('🔊 Setting up milestone real-time listener with filter:', filter);

  useRealtime({
    table: 'milestones',
    filter,
    onInsert: handleMilestoneChange,
    onUpdate: handleMilestoneChange,
    onDelete: handleMilestoneChange,
    enabled
  });
};
