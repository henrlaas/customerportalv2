
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

export const useUserProfiles = (userIds: string[]) => {
  return useQuery({
    queryKey: ['userProfiles', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', userIds);
      
      if (error) throw error;
      
      // Convert array to object for easy lookup
      const profilesMap: { [key: string]: UserProfile } = {};
      data?.forEach(profile => {
        profilesMap[profile.id] = profile;
      });
      
      return profilesMap;
    },
    enabled: userIds.length > 0,
  });
};
