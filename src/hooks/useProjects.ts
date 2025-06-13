
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
  // Fetch all projects with related data in an optimized way
  const { data: projects, isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        console.log('Fetching projects...');
        
        // Single optimized query to get projects with company details
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

        // Validate project data and detect missing company information
        const validatedProjects = projectsData.map(project => {
          if (!project.company) {
            console.warn(`Project ${project.id} (${project.name}) is missing company data`);
          }
          
          return {
            ...project,
            value: project.value || 0, // Ensure value is never null
            price_type: project.price_type || 'estimated', // Default price type
            deadline: project.deadline,
            company: project.company || null,
          };
        });

        // Check for data integrity issues
        const projectsWithMissingCompanies = validatedProjects.filter(p => !p.company);
        if (projectsWithMissingCompanies.length > 0) {
          console.error('Data integrity issue: Projects with missing company data:', 
            projectsWithMissingCompanies.map(p => ({ id: p.id, name: p.name })));
        }

        // Get all unique creator IDs from projects
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
              // Don't throw here, just continue without creator data
            } else {
              // Create a map for quick lookup
              creatorsMap = Object.fromEntries(
                (creatorsData || []).map(creator => [creator.id, creator])
              );
            }
          } catch (error) {
            console.error('Error in creator profiles query:', error);
            // Continue without creator data
          }
        }

        // Combine project data with creator data
        const projectsWithCreators = validatedProjects.map(project => ({
          ...project,
          creator: project.created_by ? creatorsMap[project.created_by] || null : null
        })) as ProjectWithRelations[];

        console.log('Projects with creators processed successfully');
        return projectsWithCreators;
      } catch (error) {
        console.error('Error in useProjects query:', error);
        throw error;
      }
    },
    staleTime: 0, // Always fetch fresh data to avoid cache issues
    retry: 3, // Increased retry count
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: true, // Refetch when returning to tab
    refetchOnMount: true, // Always refetch on component mount
    refetchInterval: false, // Don't auto-refetch
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

      // Refetch projects to update the list
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
      
      // Refetch projects to update the list
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
          // Continue without creator data
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
