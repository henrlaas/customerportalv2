
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TimeEntry } from '@/types/timeTracking';
import { format } from 'date-fns';

export const useMonthlyTimeEntries = (year: number, month: number, enabled: boolean = true) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['timeEntries', 'monthly', year, month, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Create start and end dates for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: false });
      
      if (error) {
        console.error('Error fetching monthly time entries:', error);
        throw error;
      }
      
      return data as TimeEntry[];
    },
    enabled: enabled && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCurrentMonthTimeEntries = () => {
  const now = new Date();
  return useMonthlyTimeEntries(now.getFullYear(), now.getMonth() + 1, true);
};
