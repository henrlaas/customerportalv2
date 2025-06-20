
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProjectWithRelations {
  id: string;
  name: string;
  description?: string;
  company_id: string;
  value?: number;
  price_type?: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  company?: {
    id: string;
    name: string;
    website?: string;
  };
  creator?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export const useProjects = () => {
  const queryClient = useQueryClient();

  const { data: projects, isLoading, error, refetch } = useQuery({
    queryKey: ['projects-complete'],
    queryFn: async () => {
      console.log('Fetching projects with company and creator data...');
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          company:companies (
            id,
            name,
            website
          ),
          creator:profiles!projects_created_by_fkey (
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

      console.log('Projects fetched successfully:', data?.length || 0);
      return data as ProjectWithRelations[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const createProject = useMutation({
    mutationFn: async (projectData: {
      name: string;
      description?: string;
      company_id: string;
      value?: number;
      price_type?: string;
      deadline?: string;
    }) => {
      console.log('Creating project:', projectData);
      
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }

      console.log('Project created successfully:', data);
      return data;
    },
    onSuccess: () => {
      // Real-time updates will handle query invalidation
      console.log('Project created, real-time updates will refresh the list');
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    },
  });

  const deleteProject = async (projectId: string): Promise<void> => {
    try {
      console.log('Deleting project:', projectId);
      
      // First, delete associated contracts
      const { error: contractsError } = await supabase
        .from('contracts')
        .delete()
        .eq('project_id', projectId);

      if (contractsError) {
        console.error('Error deleting project contracts:', contractsError);
        throw contractsError;
      }

      // Then delete the project
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (projectError) {
        console.error('Error deleting project:', projectError);
        throw projectError;
      }

      console.log('Project and contracts deleted successfully');
      // Real-time updates will handle query invalidation
      
    } catch (error) {
      console.error('Error in deleteProject:', error);
      throw error;
    }
  };

  return {
    projects,
    isLoading,
    error,
    refetch,
    createProject: createProject.mutate,
    createProjectAsync: createProject.mutateAsync,
    isCreating: createProject.isPending,
    deleteProject,
  };
};
