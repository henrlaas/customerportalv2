
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UpdateProjectData {
  name: string;
  description?: string;
  company_id: string;
  value?: number;
  price_type?: string;
  deadline?: string;
  assignees?: string[];
}

export const useProjectOperations = () => {
  const queryClient = useQueryClient();

  // Update project mutation
  const updateProject = useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: UpdateProjectData }) => {
      const { assignees, ...projectData } = data;

      // Update project details
      const { error: projectError } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', projectId);

      if (projectError) {
        console.error('Error updating project:', projectError);
        throw projectError;
      }

      // Update assignees if provided
      if (assignees !== undefined) {
        // First, remove existing assignees
        const { error: deleteError } = await supabase
          .from('project_assignees')
          .delete()
          .eq('project_id', projectId);

        if (deleteError) {
          console.error('Error removing existing assignees:', deleteError);
          throw deleteError;
        }

        // Then add new assignees
        if (assignees.length > 0) {
          const assigneeData = assignees.map(userId => ({
            project_id: projectId,
            user_id: userId
          }));

          const { error: insertError } = await supabase
            .from('project_assignees')
            .insert(assigneeData);

          if (insertError) {
            console.error('Error adding new assignees:', insertError);
            throw insertError;
          }
        }
      }

      return true;
    },
    onSuccess: () => {
      toast.success('Project updated successfully');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-assignees'] });
    },
    onError: (error: any) => {
      console.error('Error updating project:', error);
      toast.error(`Failed to update project: ${error.message}`);
    }
  });

  // Delete project mutation
  const deleteProject = useMutation({
    mutationFn: async (projectId: string) => {
      // Delete project assignees first
      const { error: assigneesError } = await supabase
        .from('project_assignees')
        .delete()
        .eq('project_id', projectId);

      if (assigneesError) {
        console.error('Error deleting project assignees:', assigneesError);
        throw assigneesError;
      }

      // Delete time entries
      const { error: timeEntriesError } = await supabase
        .from('time_entries')
        .delete()
        .eq('project_id', projectId);

      if (timeEntriesError) {
        console.error('Error deleting time entries:', timeEntriesError);
        throw timeEntriesError;
      }

      // Delete tasks
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', projectId);

      if (tasksError) {
        console.error('Error deleting tasks:', tasksError);
        throw tasksError;
      }

      // Delete milestones
      const { error: milestonesError } = await supabase
        .from('milestones')
        .delete()
        .eq('project_id', projectId);

      if (milestonesError) {
        console.error('Error deleting milestones:', milestonesError);
        throw milestonesError;
      }

      // Delete contracts
      const { error: contractsError } = await supabase
        .from('contracts')
        .delete()
        .eq('project_id', projectId);

      if (contractsError) {
        console.error('Error deleting contracts:', contractsError);
        throw contractsError;
      }

      // Finally delete the project
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (projectError) {
        console.error('Error deleting project:', projectError);
        throw projectError;
      }

      return true;
    },
    onSuccess: () => {
      toast.success('Project deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: any) => {
      console.error('Error deleting project:', error);
      toast.error(`Failed to delete project: ${error.message}`);
    }
  });

  return {
    updateProject,
    deleteProject
  };
};
