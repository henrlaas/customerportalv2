
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
  } | null;
}

export const useProjects = () => {
  const queryClient = useQueryClient();

  const { data: projects, isLoading, error, refetch } = useQuery({
    queryKey: ['projects-complete'],
    queryFn: async () => {
      console.log('Fetching projects with company data...');
      
      // First, fetch projects with company data only
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          company:companies (
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

      if (!projectsData || projectsData.length === 0) {
        console.log('No projects found');
        return [];
      }

      // Collect unique creator IDs
      const creatorIds = [...new Set(
        projectsData
          .map(project => project.created_by)
          .filter(Boolean)
      )] as string[];

      console.log('Fetching creator profiles for IDs:', creatorIds);

      // Fetch creator profiles separately if we have any creator IDs
      let creatorsData: any[] = [];
      if (creatorIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .in('id', creatorIds);

        if (profilesError) {
          console.error('Error fetching creator profiles:', profilesError);
          // Don't throw here, just log the error and continue without creator data
        } else {
          creatorsData = profiles || [];
        }
      }

      // Create a map of creator ID to creator data for easy lookup
      const creatorsMap = new Map();
      creatorsData.forEach(creator => {
        creatorsMap.set(creator.id, creator);
      });

      // Map projects with their creators
      const projectsWithRelations: ProjectWithRelations[] = projectsData.map(project => ({
        ...project,
        creator: project.created_by ? creatorsMap.get(project.created_by) || null : null
      }));

      console.log('Projects fetched successfully:', projectsWithRelations.length);
      return projectsWithRelations;
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
      console.log('Project created, invalidating queries for immediate update');
      
      // Immediately invalidate the main projects query for instant UI update
      queryClient.invalidateQueries({ queryKey: ['projects-complete'] });
      
      // Also invalidate related queries that might be affected
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          return query.queryKey[0] === 'user-project-assignments';
        }
      });
      
      // Invalidate all project milestones as they affect project status
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          return query.queryKey[0] === 'all-project-milestones';
        }
      });
      
      toast.success('Project created successfully');
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
