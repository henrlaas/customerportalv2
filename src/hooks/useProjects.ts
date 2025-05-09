
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project, User } from '@/types/project';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useProjects = (companyId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, isAdmin, isEmployee } = useAuth();

  // Fetch projects based on role and company
  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['projects', companyId],
    queryFn: async () => {
      let query = supabase.from('projects').select(`
        *,
        company:company_id (name, organization_number, address, postal_code, city, country),
        creator:profiles(id, first_name, last_name, avatar_url)
      `);

      // Filter by company if specified
      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      // If client, only show projects for their companies
      if (!isAdmin && !isEmployee) {
        const { data: clientCompanies } = await supabase
          .from('company_contacts')
          .select('company_id')
          .eq('user_id', user?.id);
        
        if (clientCompanies && clientCompanies.length > 0) {
          const companyIds = clientCompanies.map(c => c.company_id);
          query = query.in('company_id', companyIds);
        } else {
          // No companies for this client
          return [];
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      // Apply type casting to handle possible type mismatch
      return (data as unknown) as (Project & {
        company: { name: string; organization_number?: string; address?: string; postal_code?: string; city?: string; country?: string; };
        creator: User;
      })[];
    },
    enabled: !!user
  });

  // Create a new project
  const createProject = useMutation({
    mutationFn: async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select('*')
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Project created',
        description: 'The project has been created successfully'
      });
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      toast({
        title: 'Error creating project',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Update a project
  const updateProject = useMutation({
    mutationFn: async ({ id, ...project }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(project)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Project updated',
        description: 'The project has been updated successfully'
      });
    },
    onError: (error) => {
      console.error('Error updating project:', error);
      toast({
        title: 'Error updating project',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Delete a project
  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Project deleted',
        description: 'The project has been deleted successfully'
      });
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error deleting project',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject
  };
};
