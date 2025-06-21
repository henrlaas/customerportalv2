
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeTasks } from './useRealtimeTasks';
import { useRealtimeProjects } from './useRealtimeProjects';
import { useRealtimeCampaigns } from './useRealtimeCampaigns';
import { useRealtimeMilestones } from './useRealtimeMilestones';
import { useRealtimeTaskAssignees } from './useRealtimeTaskAssignees';
import { useRealtimeProjectAssignees } from './useRealtimeProjectAssignees';
import { useRealtimeCampaignAssignees } from './useRealtimeCampaignAssignees';

interface UseRealtimeCalendarOptions {
  enabled?: boolean;
}

export const useRealtimeCalendar = ({
  enabled = true
}: UseRealtimeCalendarOptions = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleCalendarDataChange = () => {
    console.log('Calendar data change detected, invalidating queries');
    
    // Invalidate all calendar-specific queries
    queryClient.invalidateQueries({ queryKey: ['calendar-tasks', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['calendar-projects', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['calendar-campaigns', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['project-milestones-user', user?.id] });
    
    // Also invalidate general queries that might affect calendar data
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        const key = query.queryKey[0];
        return key === 'tasks' || 
               key === 'projects' || 
               key === 'campaigns' ||
               key === 'project-milestones' ||
               key === 'all-project-milestones' ||
               key === 'task-assignees' ||
               key === 'project-assignees' ||
               key === 'campaign-assignees';
      }
    });

    console.log('Calendar queries invalidated successfully');
  };

  // Enable all real-time subscriptions for calendar-related data
  useRealtimeTasks({
    enabled,
  });

  useRealtimeProjects({
    enabled,
  });

  useRealtimeCampaigns({
    enabled,
  });

  useRealtimeMilestones({
    enabled,
  });

  useRealtimeTaskAssignees({
    enabled,
  });

  useRealtimeProjectAssignees({
    enabled,
  });

  useRealtimeCampaignAssignees({
    enabled,
  });

  return {
    handleCalendarDataChange,
  };
};
