
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TimeEntry {
  id: string;
  start_time: string;
  end_time: string | null;
  description: string | null;
  project_id: string | null;
  task_id: string | null;
  company_id: string | null;
  campaign_id: string | null;
  user_id: string;
  is_billable: boolean | null;
  is_running: boolean | null;
  created_at: string;
  updated_at: string;
  entry_source: 'direct' | 'task'; // New field to track entry source
  task_name?: string | null; // Task name for task-related entries
  employee?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ProjectTimeStats {
  totalHours: number;
  totalEntries: number;
  directHours: number;
  taskHours: number;
  entriesByUser: Record<string, { 
    hours: number; 
    entries: number; 
    directHours: number;
    taskHours: number;
    user: { 
      id: string; 
      name: string; 
      avatar_url: string | null;
    };
  }>;
}

export const useProjectTimeData = (projectId?: string) => {
  // Fetch time entries for a specific project (both direct and task-related)
  const { data: timeEntries, isLoading, error } = useQuery({
    queryKey: ['project-time-entries-enhanced', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      console.log('Fetching enhanced time entries for project:', projectId);

      try {
        // Step 1: Get all task IDs that belong to this project
        console.log('Step 1: Fetching task IDs for project:', projectId);
        const { data: projectTasks, error: tasksError } = await supabase
          .from('tasks')
          .select('id, title')
          .eq('project_id', projectId);

        if (tasksError) {
          console.error('Error fetching project tasks:', tasksError);
          throw tasksError;
        }

        const taskIds = projectTasks?.map(task => task.id) || [];
        console.log('Found task IDs for project:', taskIds.length, taskIds);

        // Step 2: Get direct project time entries
        console.log('Step 2: Fetching direct project time entries');
        const { data: directEntries, error: directError } = await supabase
          .from('time_entries')
          .select('*')
          .eq('project_id', projectId);

        if (directError) {
          console.error('Error fetching direct time entries:', directError);
          throw directError;
        }

        console.log('Direct entries found:', directEntries?.length || 0);

        // Step 3: Get task-related time entries (if we have tasks)
        let taskEntries: any[] = [];
        if (taskIds.length > 0) {
          console.log('Step 3: Fetching task-related time entries for task IDs:', taskIds);
          const { data: taskTimeEntries, error: taskEntriesError } = await supabase
            .from('time_entries')
            .select('*')
            .in('task_id', taskIds);

          if (taskEntriesError) {
            console.error('Error fetching task time entries:', taskEntriesError);
            throw taskEntriesError;
          }

          taskEntries = taskTimeEntries || [];
          console.log('Task-related entries found:', taskEntries.length);
        }

        // Step 4: Combine and format entries with task names
        const allEntries = [
          ...(directEntries || []).map(entry => ({
            ...entry,
            entry_source: 'direct' as const,
            task_name: null
          })),
          ...taskEntries.map(entry => {
            const relatedTask = projectTasks?.find(task => task.id === entry.task_id);
            return {
              ...entry,
              entry_source: 'task' as const,
              task_name: relatedTask?.title || 'Unknown Task'
            };
          })
        ];

        console.log('Total entries to process:', allEntries.length);
        console.log('Entries breakdown - Direct:', directEntries?.length || 0, 'Task-related:', taskEntries.length);

        // Step 5: Get all unique user IDs for profile data
        const userIds = Array.from(new Set(allEntries.map(entry => entry.user_id)));
        console.log('Fetching profiles for user IDs:', userIds);
        
        // Step 6: Fetch employee profiles in parallel
        const entriesWithEmployeeData = await Promise.all(
          allEntries.map(async (entry) => {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, avatar_url')
              .eq('id', entry.user_id)
              .single();

            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Error fetching employee profile for user:', entry.user_id, profileError);
            }

            return {
              ...entry,
              employee: profileData
            } as TimeEntry;
          })
        );

        console.log('Enhanced entries processed successfully:', entriesWithEmployeeData.length);
        console.log('Sample entries:', entriesWithEmployeeData.slice(0, 3).map(e => ({
          id: e.id,
          source: e.entry_source,
          task_name: e.task_name,
          description: e.description
        })));
        
        return entriesWithEmployeeData;
      } catch (error) {
        console.error('Error in enhanced project time data fetch:', error);
        throw error;
      }
    },
    enabled: !!projectId,
    staleTime: 30000,
  });

  // Calculate enhanced time statistics
  const timeStats: ProjectTimeStats = {
    totalHours: 0,
    totalEntries: timeEntries?.length || 0,
    directHours: 0,
    taskHours: 0,
    entriesByUser: {},
  };

  timeEntries?.forEach(entry => {
    // Calculate hours for this entry
    let hours = 0;
    const startTime = new Date(entry.start_time);
    const endTime = entry.end_time ? new Date(entry.end_time) : new Date();
    
    // Calculate duration in hours
    hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    timeStats.totalHours += hours;

    // Track direct vs task hours
    if (entry.entry_source === 'direct') {
      timeStats.directHours += hours;
    } else {
      timeStats.taskHours += hours;
    }

    // Add to user-specific stats
    const userId = entry.user_id;
    const userName = entry.employee ? 
      `${entry.employee.first_name || ''} ${entry.employee.last_name || ''}`.trim() || 'Unknown'
      : 'Unknown';
    
    if (!timeStats.entriesByUser[userId]) {
      timeStats.entriesByUser[userId] = {
        hours: 0,
        entries: 0,
        directHours: 0,
        taskHours: 0,
        user: {
          id: userId,
          name: userName,
          avatar_url: entry.employee?.avatar_url || null,
        },
      };
    }

    timeStats.entriesByUser[userId].hours += hours;
    timeStats.entriesByUser[userId].entries += 1;
    
    if (entry.entry_source === 'direct') {
      timeStats.entriesByUser[userId].directHours += hours;
    } else {
      timeStats.entriesByUser[userId].taskHours += hours;
    }
  });

  return {
    timeEntries,
    isLoading,
    error,
    timeStats,
  };
};
