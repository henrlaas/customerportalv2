
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
  entriesByUser: Record<string, { 
    hours: number; 
    entries: number; 
    user: { 
      id: string; 
      name: string; 
      avatar_url: string | null;
    };
  }>;
}

export const useProjectTimeData = (projectId?: string) => {
  // Fetch time entries for a specific project
  const { data: timeEntries, isLoading, error } = useQuery({
    queryKey: ['project-time-entries', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      // First get time entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('project_id', projectId);

      if (entriesError) {
        console.error('Error fetching time entries:', entriesError);
        throw entriesError;
      }

      // Then get profile data for each user
      const entriesWithEmployeeData = await Promise.all(
        entriesData.map(async (entry) => {
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

      return entriesWithEmployeeData;
    },
    enabled: !!projectId,
  });

  // Calculate time statistics for the project
  const timeStats: ProjectTimeStats = {
    totalHours: 0,
    totalEntries: timeEntries?.length || 0,
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

    // Add to user-specific stats
    const userId = entry.user_id;
    const userName = entry.employee ? 
      `${entry.employee.first_name || ''} ${entry.employee.last_name || ''}`.trim() || 'Unknown'
      : 'Unknown';
    
    if (!timeStats.entriesByUser[userId]) {
      timeStats.entriesByUser[userId] = {
        hours: 0,
        entries: 0,
        user: {
          id: userId,
          name: userName,
          avatar_url: entry.employee?.avatar_url || null,
        },
      };
    }

    timeStats.entriesByUser[userId].hours += hours;
    timeStats.entriesByUser[userId].entries += 1;
  });

  return {
    timeEntries,
    isLoading,
    error,
    timeStats,
  };
};
