
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
        // First get direct project time entries
        const { data: directEntries, error: directError } = await supabase
          .from('time_entries')
          .select('*')
          .eq('project_id', projectId);

        if (directError) {
          console.error('Error fetching direct time entries:', directError);
          throw directError;
        }

        // Then get task-related time entries for this project
        const { data: taskEntries, error: taskError } = await supabase
          .from('time_entries')
          .select(`
            *,
            tasks!inner(
              id,
              title,
              project_id
            )
          `)
          .eq('tasks.project_id', projectId)
          .not('task_id', 'is', null);

        if (taskError) {
          console.error('Error fetching task time entries:', taskError);
          throw taskError;
        }

        console.log('Direct entries found:', directEntries?.length || 0);
        console.log('Task entries found:', taskEntries?.length || 0);

        // Combine and format entries
        const allEntries = [
          ...(directEntries || []).map(entry => ({
            ...entry,
            entry_source: 'direct' as const,
            task_name: null
          })),
          ...(taskEntries || []).map(entry => ({
            ...entry,
            entry_source: 'task' as const,
            task_name: (entry as any).tasks?.title || 'Unknown Task'
          }))
        ];

        console.log('Total entries to process:', allEntries.length);

        // Get all unique user IDs for profile data
        const userIds = Array.from(new Set(allEntries.map(entry => entry.user_id)));
        
        // Fetch employee profiles
        const entriesWithEmployeeData = await Promise.all(
          allEntries.map(async (entry) => {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, avatar_url')
              .eq('id', entry.user_id)
              .single();

            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Error fetching employee profile:', profileError);
            }

            return {
              ...entry,
              employee: profileData
            } as TimeEntry;
          })
        );

        console.log('Enhanced entries processed successfully:', entriesWithEmployeeData.length);
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
