
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CampaignAssignee {
  id: string;
  campaign_id: string;
  user_id: string;
  created_at: string;
  profiles?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    role: string;
  } | null;
}

export const useCampaignAssignees = (campaignId?: string) => {
  const queryClient = useQueryClient();

  // Fetch assignees for a specific campaign
  const { data: assignees, isLoading, error, refetch } = useQuery({
    queryKey: ['campaign-assignees', campaignId],
    queryFn: async () => {
      if (!campaignId) return [];

      // First get the campaign assignees
      const { data: assigneesData, error: assigneesError } = await supabase
        .from('campaign_assignees')
        .select('*')
        .eq('campaign_id', campaignId);

      if (assigneesError) {
        console.error('Error fetching campaign assignees:', assigneesError);
        throw assigneesError;
      }

      // Then get the profiles for those assignees including the role
      const assigneesWithProfiles = await Promise.all(
        assigneesData.map(async (assignee) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar_url, role')
            .eq('id', assignee.user_id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError);
          }

          const fullName = profileData
            ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Unknown User'
            : 'Unknown User';

          return {
            ...assignee,
            profiles: profileData,
            full_name: fullName
          } as CampaignAssignee & { full_name: string };
        })
      );

      return assigneesWithProfiles;
    },
    enabled: !!campaignId,
  });

  // Add an assignee to a campaign
  const addAssignee = useMutation({
    mutationFn: async ({ campaignId, userId }: { campaignId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('campaign_assignees')
        .insert({
          campaign_id: campaignId,
          user_id: userId,
        })
        .select();

      if (error) {
        console.error('Error adding campaign assignee:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-assignees', campaignId] });
    },
  });

  // Remove an assignee from a campaign
  const removeAssignee = useMutation({
    mutationFn: async (assigneeId: string) => {
      const { error } = await supabase
        .from('campaign_assignees')
        .delete()
        .eq('id', assigneeId);

      if (error) {
        console.error('Error removing campaign assignee:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-assignees', campaignId] });
    },
  });

  return {
    assignees,
    isLoading,
    error,
    addAssignee,
    removeAssignee,
    refetch,
  };
};
