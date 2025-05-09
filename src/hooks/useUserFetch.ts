
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string;
}

export const useUserFetch = () => {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('first_name');
      
      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      return profiles;
    },
  });

  return {
    users,
    isLoading,
    isError: !!error,
  };
};
