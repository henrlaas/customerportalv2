
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectAssignee {
  id: string;
  project_id: string;
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

export const useProjectAssignees = (projectId?: string) => {
  const queryClient = useQueryClient();

  // Fetch assignees for a specific project
  const { data: assignees, isLoading, error, refetch } = useQuery({
    queryKey: ['project-assignees', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      // First get the project assignees
      const { data: assigneesData, error: assigneesError } = await supabase
        .from('project_assignees')
        .select('*')
        .eq('project_id', projectId);

      if (assigneesError) {
        console.error('Error fetching project assignees:', assigneesError);
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
          } as ProjectAssignee & { full_name: string };
        })
      );

      return assigneesWithProfiles;
    },
    enabled: !!projectId,
  });

  // Add an assignee to a project
  const addAssignee = useMutation({
    mutationFn: async ({ projectId, userId }: { projectId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('project_assignees')
        .insert({
          project_id: projectId,
          user_id: userId,
        })
        .select();

      if (error) {
        console.error('Error adding assignee:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-assignees', projectId] });
    },
  });

  // Remove an assignee from a project
  const removeAssignee = useMutation({
    mutationFn: async (assigneeId: string) => {
      const { error } = await supabase
        .from('project_assignees')
        .delete()
        .eq('id', assigneeId);

      if (error) {
        console.error('Error removing assignee:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-assignees', projectId] });
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
