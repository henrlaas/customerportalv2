
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../useRealtime';

interface UseRealtimeTasksOptions {
  taskId?: string;
  projectId?: string;
  enabled?: boolean;
}

export const useRealtimeTasks = ({
  taskId,
  projectId,
  enabled = true
}: UseRealtimeTasksOptions = {}) => {
  const queryClient = useQueryClient();

  const handleTaskChange = (payload: any) => {
    console.log('🔄 Real-time task change detected:', payload);
    
    // Get the changed task's project and task IDs
    const changedTaskId = payload.new?.id || payload.old?.id;
    const changedProjectId = payload.new?.project_id || payload.old?.project_id;
    const oldStatus = payload.old?.status;
    const newStatus = payload.new?.status;
    
    console.log('📝 Task change details:', {
      taskId: changedTaskId,
      projectId: changedProjectId,
      statusChange: `${oldStatus} → ${newStatus}`,
      payload
    });
    
    // CRITICAL: Force invalidate calendar queries immediately with refetch
    console.log('📅 Invalidating calendar queries...');
    queryClient.invalidateQueries({ 
      queryKey: ['calendar-tasks'],
      refetchType: 'active'
    });
    
    // Also invalidate user-specific calendar queries
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const isCalendarQuery = query.queryKey[0] === 'calendar-tasks' || 
                               query.queryKey[0] === 'calendar-projects' ||
                               query.queryKey[0] === 'calendar-campaigns';
        if (isCalendarQuery) {
          console.log('🎯 Invalidating calendar query:', query.queryKey);
        }
        return isCalendarQuery;
      },
      refetchType: 'active'
    });
    
    // Always invalidate general task queries
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['user-task-stats'] });
    
    // Invalidate specific task if we have an ID
    if (changedTaskId) {
      queryClient.invalidateQueries({ queryKey: ['task', changedTaskId] });
    }
    
    // CRITICAL: Always invalidate project-specific task queries when a task has a project_id
    if (changedProjectId) {
      console.log('📁 Invalidating project-specific queries for project:', changedProjectId);
      queryClient.invalidateQueries({ queryKey: ['project-tasks', changedProjectId] });
      queryClient.invalidateQueries({ queryKey: ['project-time-entries-enhanced', changedProjectId] });
    }
    
    // Also invalidate for the current project being viewed (if specified)
    if (projectId && projectId !== changedProjectId) {
      console.log('📁 Also invalidating current project queries:', projectId);
      queryClient.invalidateQueries({ queryKey: ['project-tasks', projectId] });
    }
    
    // Invalidate specific task query if monitoring specific task
    if (taskId) {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    }
    
    // Broad invalidation to ensure all task-related views update
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const key = query.queryKey[0];
        return key === 'project-tasks' || 
               key === 'tasks' || 
               key === 'user-task-stats' ||
               key === 'calendar-tasks' ||
               key === 'project-time-entries-enhanced';
      },
      refetchType: 'active'
    });

    console.log('✅ Task queries invalidated successfully, including calendar queries');
  };

  // REMOVE RESTRICTIVE FILTERS - Listen to ALL task changes
  const filter = undefined;

  useRealtime({
    table: 'tasks',
    filter,
    onInsert: handleTaskChange,
    onUpdate: handleTaskChange,
    onDelete: handleTaskChange,
    enabled
  });
};
