
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
  } | null;
}

export const useProjectAssignees = (projectId?: string) => {
  const queryClient = useQueryClient();

  // Fetch assignees for a specific project
  const { data: assignees, isLoading, error, refetch } = useQuery({
    queryKey: ['project-assignees', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('project_assignees')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching project assignees:', error);
        throw error;
      }

      return data.map(item => ({
        ...item,
        // Add null check for profiles
        full_name: item.profiles ? 
          `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim() || 'Unknown User' 
          : 'Unknown User'
      })) as ProjectAssignee[];
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
