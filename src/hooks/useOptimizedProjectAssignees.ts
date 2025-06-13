
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectAssigneeData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

export const useOptimizedProjectAssignees = (projectIds: string[]) => {
  return useQuery({
    queryKey: ['project-assignees-batch', projectIds.sort()],
    queryFn: async () => {
      if (!projectIds.length) return {};
      
      console.log('Fetching optimized assignees for projects:', projectIds);
      
      try {
        // Step 1: Get all project assignees for all projects
        const { data: assigneesData, error: assigneesError } = await supabase
          .from('project_assignees')
          .select('project_id, user_id')
          .in('project_id', projectIds);
        
        if (assigneesError) {
          console.error('Error fetching project assignees:', assigneesError);
          throw assigneesError;
        }

        if (!assigneesData || assigneesData.length === 0) {
          console.log('No assignees found for projects');
          return {};
        }

        // Step 2: Get unique user IDs and fetch their profiles
        const userIds = Array.from(new Set(assigneesData.map(assignee => assignee.user_id)));
        console.log('Fetching profiles for user IDs:', userIds);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .in('id', userIds);
        
        if (profilesError) {
          console.error('Error fetching user profiles:', profilesError);
          throw profilesError;
        }

        // Step 3: Create a map of user profiles for quick lookup
        const profilesMap = new Map();
        (profilesData || []).forEach(profile => {
          profilesMap.set(profile.id, profile);
        });

        // Step 4: Group assignees by project_id and enrich with profile data
        const assigneesByProject: Record<string, ProjectAssigneeData[]> = {};
        
        for (const assignee of assigneesData) {
          if (!assigneesByProject[assignee.project_id]) {
            assigneesByProject[assignee.project_id] = [];
          }
          
          const profile = profilesMap.get(assignee.user_id);
          if (profile) {
            assigneesByProject[assignee.project_id].push({
              id: assignee.user_id,
              first_name: profile.first_name,
              last_name: profile.last_name,
              avatar_url: profile.avatar_url
            });
          } else {
            console.warn('Profile not found for user:', assignee.user_id);
            // Still add the assignee with minimal data
            assigneesByProject[assignee.project_id].push({
              id: assignee.user_id,
              first_name: null,
              last_name: null,
              avatar_url: null
            });
          }
        }
        
        console.log('Optimized assignees grouped by project:', Object.keys(assigneesByProject).length, 'projects');
        return assigneesByProject;
      } catch (error) {
        console.error('Error in optimized project assignees query:', error);
        throw error;
      }
    },
    enabled: projectIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes - more conservative like contracts
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false, // Prevent aggressive refetching
  });
};
