
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCalendarData = () => {
  // Fetch tasks with due dates
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['calendar-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, priority, status, due_date')
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching calendar tasks:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch projects with deadlines
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['calendar-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, deadline, value')
        .not('deadline', 'is', null)
        .order('deadline', { ascending: true });

      if (error) {
        console.error('Error fetching calendar projects:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    tasks,
    projects,
    isLoading: tasksLoading || projectsLoading,
  };
};
