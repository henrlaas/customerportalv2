
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
      // Fetch projects with company and creator details
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          company:company_id (
            id,
            name
          ),
          creator:created_by (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      return data as ProjectWithRelations[];
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

  // Function to get a project by id with all related data
  const getProject = async (projectId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        company:company_id (*),
        creator:created_by (
          id, 
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project details:', error);
      throw error;
    }

    return data as ProjectWithRelations;
  };

  return {
    projects,
    isLoading,
    error,
    createProject,
    getProject,
    refetch,
  };
};
