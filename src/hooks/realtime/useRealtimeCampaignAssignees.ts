
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../useRealtime';

interface UseRealtimeCampaignAssigneesOptions {
  campaignId?: string;
  enabled?: boolean;
}

export const useRealtimeCampaignAssignees = ({
  campaignId,
  enabled = true
}: UseRealtimeCampaignAssigneesOptions = {}) => {
  const queryClient = useQueryClient();

  const handleAssigneeChange = (payload: any) => {
    console.log('Real-time campaign assignee change detected:', payload);
    
    const changedCampaignId = payload.new?.campaign_id || payload.old?.campaign_id;
    const changedUserId = payload.new?.user_id || payload.old?.user_id;
    
    // Invalidate campaign assignee queries
    queryClient.invalidateQueries({ queryKey: ['campaign-assignees'] });
    queryClient.invalidateQueries({ queryKey: ['user-campaign-assignments'] });
    
    // Invalidate calendar queries for the affected user
    if (changedUserId) {
      queryClient.invalidateQueries({ queryKey: ['calendar-campaigns', changedUserId] });
    }
    
    // Invalidate specific campaign data
    if (changedCampaignId) {
      queryClient.invalidateQueries({ queryKey: ['campaign', changedCampaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-assignees', changedCampaignId] });
    }
    
    if (campaignId) {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-assignees', campaignId] });
    }
    
    // Broad invalidation for assignee-related queries
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'campaign-assignees' ||
               query.queryKey[0] === 'user-campaign-assignments' ||
               query.queryKey[0] === 'calendar-campaigns';
      }
    });

    console.log('Campaign assignee queries invalidated');
  };

  const filter = undefined; // Listen to all changes to catch cross-campaign updates

  useRealtime({
    table: 'campaign_assignees',
    filter,
    onInsert: handleAssigneeChange,
    onUpdate: handleAssigneeChange,
    onDelete: handleAssigneeChange,
    enabled
  });
};
