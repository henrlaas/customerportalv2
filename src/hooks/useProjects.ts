
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectWithRelations {
  id: string;
  name: string;
  description: string | null;
  company_id: string;
  value: number | null;
  price_type: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  company: {
    id: string;
    name: string;
    website?: string | null;
  } | null;
  creator: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

export const useProjects = () => {
  // Single optimized query for all project data
  const { data: projects, isLoading, error, refetch } = useQuery({
    queryKey: ['projects-complete'],
    queryFn: async () => {
      try {
        console.log('Fetching complete projects data...');
        
        // Single comprehensive query with all necessary joins
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select(`
            *,
            company:company_id (
              id,
              name,
              website
            )
          `)
          .order('created_at', { ascending: false });

        if (projectsError) {
          console.error('Error fetching projects:', projectsError);
          throw projectsError;
        }

        console.log(`Fetched ${projectsData?.length || 0} projects`);

        if (!projectsData || projectsData.length === 0) {
          return [];
        }

        // Validate and clean project data
        const validatedProjects = projectsData.map(project => ({
          ...project,
          value: project.value || 0,
          price_type: project.price_type || 'estimated',
          deadline: project.deadline,
          company: project.company || null,
        }));

        // Get all unique creator IDs
        const creatorIds = Array.from(new Set(
          validatedProjects
            .map(project => project.created_by)
            .filter(Boolean)
        )) as string[];

        let creatorsMap: Record<string, any> = {};

        // Batch fetch creator profiles if there are any
        if (creatorIds.length > 0) {
          try {
            const { data: creatorsData, error: creatorsError } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, avatar_url')
              .in('id', creatorIds);

            if (creatorsError) {
              console.error('Error fetching creator profiles:', creatorsError);
            } else {
              creatorsMap = Object.fromEntries(
                (creatorsData || []).map(creator => [creator.id, creator])
              );
            }
          } catch (error) {
            console.error('Error in creator profiles query:', error);
          }
        }

        // Combine project data with creator data
        const projectsWithCreators = validatedProjects.map(project => ({
          ...project,
          creator: project.created_by ? creatorsMap[project.created_by] || null : null
        })) as ProjectWithRelations[];

        console.log('Complete projects data processed successfully');
        return projectsWithCreators;
      } catch (error) {
        console.error('Error in useProjects query:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - conservative like contracts
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false, // Prevent aggressive refetching
    refetchOnMount: false, // Only refetch when explicitly needed
  });

  // Function to create a new project
  const createProject = async (projectData: {
    name: string;
    description?: string;
    company_id: string;
    value?: number;
    price_type?: string;
    deadline?: string;
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          created_by: userId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }

      // Force refetch to update the list
      refetch();
      return data;
    } catch (error) {
      console.error('Error in createProject:', error);
      throw error;
    }
  };
  
  // Function to delete a project by id
  const deleteProject = async (projectId: string) => {
    try {
      console.log(`Starting deletion process for project ID: ${projectId}`);
      
      // First delete any associated contracts
      const { error: contractsError } = await supabase
        .from('contracts')
        .delete()
        .eq('project_id', projectId);
        
      if (contractsError) {
        console.error('Error deleting associated contracts:', contractsError);
        throw contractsError;
      }
      
      // Then delete the project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Error deleting project:', error);
        throw error;
      }

      console.log(`Successfully deleted project ID: ${projectId}`);
      
      // Force refetch to update the list
      refetch();
      return true;
    } catch (error) {
      console.error('Error in deleteProject:', error);
      throw error;
    }
  };

  // Function to get a project by id with all related data
  const getProject = async (projectId: string): Promise<ProjectWithRelations> => {
    try {
      console.log(`Fetching project details for ID: ${projectId}`);
      
      // Get project with company details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          company:company_id (*)
        `)
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Error fetching project details:', projectError);
        throw projectError;
      }

      // Get creator details separately if created_by exists
      let creatorData = null;
      if (projectData.created_by) {
        try {
          const { data: creator, error: creatorError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar_url')
            .eq('id', projectData.created_by)
            .single();

          if (creatorError && creatorError.code !== 'PGRST116') {
            console.error('Error fetching creator details:', creatorError);
          } else {
            creatorData = creator;
          }
        } catch (error) {
          console.error('Error in creator query:', error);
        }
      }

      // Combine project data with creator data
      const result = {
        ...projectData,
        creator: creatorData
      } as ProjectWithRelations;

      console.log('Project details fetched successfully');
      return result;
    } catch (error) {
      console.error('Error in getProject:', error);
      throw error;
    }
  };

  return {
    projects,
    isLoading,
    error,
    createProject,
    deleteProject,
    getProject,
    refetch,
  };
};
