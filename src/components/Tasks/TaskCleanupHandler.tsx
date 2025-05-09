
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { differenceInDays } from 'date-fns';

/**
 * Component that manages automatic cleanup of tasks that have been in "Completed" status
 * for 5 days or more
 */
export const TaskCleanupHandler: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation for deleting tasks
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      console.log(`Task ${id} has been automatically deleted as it was completed for more than 5 days.`);
    },
    onError: (error: any) => {
      toast({
        title: 'Auto-cleanup error',
        description: `Failed to delete outdated task: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Fetch all completed tasks
  const { data: completedTasks = [] } = useQuery({
    queryKey: ['completed_tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'completed');

      if (error) {
        console.error('Error fetching completed tasks:', error);
        return [];
      }

      return data;
    },
  });

  // Check and cleanup tasks that have been completed for too long
  useEffect(() => {
    if (!completedTasks.length) return;

    const now = new Date();
    const tasksToDelete: string[] = [];

    completedTasks.forEach((task) => {
      const updatedAt = new Date(task.updated_at);
      const daysSinceUpdate = differenceInDays(now, updatedAt);

      if (daysSinceUpdate >= 5) {
        tasksToDelete.push(task.id);
      }
    });

    // Delete eligible tasks
    if (tasksToDelete.length > 0) {
      tasksToDelete.forEach(id => {
        deleteTaskMutation.mutate(id);
      });
    }
  }, [completedTasks]);

  // This is a utility component that doesn't render anything
  return null;
};
