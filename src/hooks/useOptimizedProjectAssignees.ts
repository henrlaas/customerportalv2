
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
        // Get all assignees for all projects in a single query
        const { data: assigneesData, error: assigneesError } = await supabase
          .from('project_assignees')
          .select(`
            project_id,
            user_id,
            profiles!inner(
              id,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .in('project_id', projectIds);
        
        if (assigneesError) {
          console.error('Error fetching project assignees:', assigneesError);
          throw assigneesError;
        }

        // Group assignees by project_id
        const assigneesByProject: Record<string, ProjectAssigneeData[]> = {};
        
        for (const assignee of assigneesData || []) {
          if (!assigneesByProject[assignee.project_id]) {
            assigneesByProject[assignee.project_id] = [];
          }
          
          if (assignee.profiles) {
            assigneesByProject[assignee.project_id].push({
              id: assignee.user_id,
              first_name: assignee.profiles.first_name,
              last_name: assignee.profiles.last_name,
              avatar_url: assignee.profiles.avatar_url
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
