
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, isBefore } from 'date-fns';

export const useCalendarData = (currentDate: Date = new Date()) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const today = new Date();

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

  // Fetch project milestones to determine project completion status
  const { data: milestones, isLoading: milestonesLoading } = useQuery({
    queryKey: ['project-milestones-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milestones')
        .select('project_id, status');

      if (error) {
        console.error('Error fetching milestones:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Calculate monthly statistics
  const monthlyStats = {
    totalTasks: 0,
    totalProjects: 0,
    overdueTasks: 0,
    overdueProjects: 0
  };

  if (tasks) {
    // Tasks this month (based on due date)
    const monthTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= monthStart && dueDate <= monthEnd;
    });
    
    monthlyStats.totalTasks = monthTasks.length;
    
    // Overdue tasks (not completed and past due date)
    monthlyStats.overdueTasks = tasks.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      const dueDate = new Date(task.due_date);
      return isBefore(dueDate, today);
    }).length;
  }

  if (projects && milestones) {
    // Projects this month (based on deadline)
    const monthProjects = projects.filter(project => {
      if (!project.deadline) return false;
      const deadline = new Date(project.deadline);
      return deadline >= monthStart && deadline <= monthEnd;
    });
    
    monthlyStats.totalProjects = monthProjects.length;
    
    // Overdue projects (not completed and past deadline)
    monthlyStats.overdueProjects = projects.filter(project => {
      if (!project.deadline) return false;
      const deadline = new Date(project.deadline);
      if (!isBefore(deadline, today)) return false;
      
      // Check if project is completed (all milestones completed)
      const projectMilestones = milestones.filter(m => m.project_id === project.id);
      if (projectMilestones.length === 0) return true; // No milestones = not completed
      
      const allCompleted = projectMilestones.every(m => m.status === 'completed');
      return !allCompleted;
    }).length;
  }

  return {
    tasks,
    projects,
    monthlyStats,
    isLoading: tasksLoading || projectsLoading || milestonesLoading,
  };
};
