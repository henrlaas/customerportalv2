
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, isBefore } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export const useCalendarData = (currentDate: Date = new Date()) => {
  const { user } = useAuth();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const today = new Date();

  // Fetch tasks assigned to the current user through task_assignees table - exclude completed tasks
  const { data: allTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['calendar-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching calendar tasks for user:', user.id);
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id, 
          title, 
          priority, 
          status, 
          due_date,
          task_assignees!inner(user_id)
        `)
        .not('due_date', 'is', null)
        .neq('status', 'completed')
        .eq('task_assignees.user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching calendar tasks:', error);
        throw error;
      }

      console.log('Calendar tasks found:', data);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch projects with deadlines where user is assigned
  const { data: allProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['calendar-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching calendar projects for user:', user.id);
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id, 
          name, 
          deadline, 
          value,
          project_assignees!inner(user_id)
        `)
        .not('deadline', 'is', null)
        .eq('project_assignees.user_id', user.id)
        .order('deadline', { ascending: true });

      if (error) {
        console.error('Error fetching calendar projects:', error);
        throw error;
      }

      console.log('Calendar projects found:', data);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch project milestones for the user's assigned projects to determine completion status
  const { data: milestones, isLoading: milestonesLoading } = useQuery({
    queryKey: ['project-milestones-user', user?.id],
    queryFn: async () => {
      if (!user?.id || !allProjects?.length) return [];
      
      const projectIds = allProjects.map(p => p.id);
      
      const { data, error } = await supabase
        .from('milestones')
        .select('project_id, status')
        .in('project_id', projectIds);

      if (error) {
        console.error('Error fetching milestones:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id && !!allProjects?.length,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter out completed projects
  const projects = allProjects?.filter(project => {
    if (!milestones) return true; // If milestones not loaded yet, include all projects
    
    const projectMilestones = milestones.filter(m => m.project_id === project.id);
    
    // If no milestones, project is not completed
    if (projectMilestones.length === 0) return true;
    
    // If not all milestones are completed, project is not completed
    const allCompleted = projectMilestones.every(m => m.status === 'completed');
    return !allCompleted;
  }) || [];

  // Use filtered data
  const tasks = allTasks || [];

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
    
    // Overdue tasks (not completed and past due date) - already filtered out completed tasks
    monthlyStats.overdueTasks = tasks.filter(task => {
      if (!task.due_date) return false;
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
    
    // Overdue projects (not completed and past deadline) - already filtered out completed projects
    monthlyStats.overdueProjects = projects.filter(project => {
      if (!project.deadline) return false;
      const deadline = new Date(project.deadline);
      return isBefore(deadline, today);
    }).length;
  }

  console.log('Calendar data summary:', {
    userId: user?.id,
    tasksCount: tasks.length,
    projectsCount: projects.length,
    monthlyStats
  });

  return {
    tasks,
    projects,
    monthlyStats,
    isLoading: tasksLoading || projectsLoading || milestonesLoading || !user,
  };
};
