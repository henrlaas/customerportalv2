
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../useRealtime';

interface UseRealtimeProjectsOptions {
  projectId?: string;
  enabled?: boolean;
}

export const useRealtimeProjects = ({
  projectId,
  enabled = true
}: UseRealtimeProjectsOptions = {}) => {
  const queryClient = useQueryClient();

  const handleProjectChange = (payload: any) => {
    console.log('Real-time project change detected:', payload);
    
    // Get the changed project's ID
    const changedProjectId = payload.new?.id || payload.old?.id;
    
    console.log('Changed project ID:', changedProjectId);
    
    // CRITICAL: Invalidate the correct query key used by ProjectsPage
    queryClient.invalidateQueries({ queryKey: ['projects-complete'] });
    
    // Also invalidate user project assignments since they affect filtering
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'user-project-assignments';
      }
    });
    
    // Invalidate all project milestones as they affect project status
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'all-project-milestones';
      }
    });
    
    // Invalidate specific project if we have an ID
    if (changedProjectId) {
      queryClient.invalidateQueries({ queryKey: ['project', changedProjectId] });
    }
    
    // Also invalidate for the current project being viewed (if specified)
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    }
    
    console.log('Project queries invalidated successfully');
  };

  const filter = projectId ? `id=eq.${projectId}` : undefined;

  useRealtime({
    table: 'projects',
    filter,
    onInsert: handleProjectChange,
    onUpdate: handleProjectChange,
    onDelete: handleProjectChange,
    enabled
  });
};
