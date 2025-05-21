
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectWithRelations {
  id: string;
  name: string;
  description: string | null;
  company_id: string;
  value: number;
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
  // Fetch all projects with related data
  const { data: projects, isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      // First get projects with company details
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

      // Then get creator profiles separately
      const projectsWithCreators = await Promise.all(
        projectsData.map(async (project) => {
          // Only fetch creator if created_by is present
          if (project.created_by) {
            const { data: creatorData, error: creatorError } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, avatar_url')
              .eq('id', project.created_by)
              .single();

            if (creatorError && creatorError.code !== 'PGRST116') {
              console.error('Error fetching creator profile:', creatorError);
            }

            return {
              ...project,
              creator: creatorData || null
            } as ProjectWithRelations;
          }

          // Return project without creator data if created_by is null
          return {
            ...project,
            creator: null
          } as ProjectWithRelations;
        })
      );

      return projectsWithCreators;
    },
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
  };
  
  // Function to delete a project by id
  const deleteProject = async (projectId: string) => {
    try {
      // First delete any associated contracts
      console.log(`Deleting contracts for project ID: ${projectId}`);
      const { error: contractsError } = await supabase
        .from('contracts')
        .delete()
        .eq('project_id', projectId);
        
      if (contractsError) {
        console.error('Error deleting associated contracts:', contractsError);
        throw contractsError;
      }
      
      // Then delete the project
      console.log(`Deleting project ID: ${projectId}`);
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Error deleting project:', error);
        throw error;
      }

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
    }

    // Combine project data with creator data
    return {
      ...projectData,
      creator: creatorData
    } as ProjectWithRelations;
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
