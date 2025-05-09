
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectAssignee, User } from '@/types/project';
import { useToast } from '@/components/ui/use-toast';

export const useProjectAssignees = (projectId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: assignees,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['project-assignees', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_assignees')
        .select(`
          *,
          user:profiles(id, first_name, last_name, avatar_url, role)
        `)
        .eq('project_id', projectId!);

      if (error) throw error;
      
      // Use type assertion with unknown as intermediate step
      return (data as unknown) as (ProjectAssignee & {
        user: User;
      })[];
    },
    enabled: !!projectId
  });

  const assignUsers = useMutation({
    mutationFn: async (userIds: string[]) => {
      // Create assignee objects
      const assigneeData = userIds.map(userId => ({
        project_id: projectId!,
        user_id: userId
      }));

      const { data, error } = await supabase
        .from('project_assignees')
        .insert(assigneeData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-assignees', projectId] });
      toast({
        title: 'Users assigned',
        description: 'Users have been assigned to the project'
      });
    },
    onError: (error) => {
      console.error('Error assigning users:', error);
      toast({
        title: 'Error assigning users',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const removeAssignee = useMutation({
    mutationFn: async (assigneeId: string) => {
      const { error } = await supabase
        .from('project_assignees')
        .delete()
        .eq('id', assigneeId);

      if (error) throw error;
      return assigneeId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-assignees', projectId] });
      toast({
        title: 'User removed',
        description: 'User has been removed from the project'
      });
    },
    onError: (error) => {
      console.error('Error removing user:', error);
      toast({
        title: 'Error removing user',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    assignees,
    isLoading,
    error,
    assignUsers,
    removeAssignee
  };
};
