
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminEmployeeProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string;
}

export const useAdminEmployeeProfiles = () => {
  return useQuery({
    queryKey: ['admin-employee-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, role')
        .in('role', ['admin', 'employee'])
        .order('first_name');
      
      if (error) throw error;
      
      return data as AdminEmployeeProfile[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
