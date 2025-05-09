
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ProjectAssignee = {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
};

export type User = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email?: string;
};

export const useProjectAssignees = (projectId: string | null) => {
  const queryClient = useQueryClient();
  
  const { data: assignees = [], isLoading } = useQuery({
    queryKey: ['project-assignees', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      // First get the assignees
      const { data, error } = await supabase
        .from('project_assignees')
        .select(`
          id, 
          project_id, 
          user_id,
          created_at,
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
      
      // Transform the data to match our expected type
      return data.map(item => {
        // Handle the case where profiles might be null or a SelectQueryError
        let user: User;
        
        if (item.profiles && 
            typeof item.profiles === 'object' && 
            !('error' in item.profiles)) {
          // We need to safely access item.profiles which might be null
          user = {
            id: item.user_id,
            first_name: item.profiles.first_name,
            last_name: item.profiles.last_name,
            avatar_url: item.profiles.avatar_url
          };
        } else {
          // Create a fallback user object if profiles is not found
          user = {
            id: item.user_id,
            first_name: null,
            last_name: null,
            avatar_url: null
          };
        }
            
        return {
          id: item.id,
          project_id: item.project_id,
          user_id: item.user_id,
          created_at: item.created_at,
          user
        };
      }) as (ProjectAssignee & { user: User })[];
    },
    enabled: !!projectId
  });

  // Add an assignee
  const { mutateAsync: addAssignee } = useMutation({
    mutationFn: async ({ projectId, userId }: { projectId: string, userId: string }) => {
      const { data, error } = await supabase
        .from('project_assignees')
        .insert({
          project_id: projectId,
          user_id: userId
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding assignee:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-assignees', projectId] });
    }
  });
  
  // Remove an assignee
  const { mutateAsync: removeAssignee } = useMutation({
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
    }
  });
  
  return {
    assignees,
    isLoading,
    addAssignee,
    removeAssignee
  };
};
