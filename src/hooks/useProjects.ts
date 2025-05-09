
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Project, ProjectWithRelations, PriceType } from '@/types/project';

export const useProjects = (companyId?: string) => {
  const { user, isAdmin, isEmployee } = useAuth();
  const queryClient = useQueryClient();

  // Fetch projects based on role and optional companyId
  const projectsQuery = useQuery({
    queryKey: ['projects', companyId],
    queryFn: async (): Promise<ProjectWithRelations[]> => {
      let query = supabase
        .from('projects')
        .select(`
          *,
          company:companies(*),
          creator:profiles!projects_created_by_fkey(*)
        `);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      // Type cast to ensure proper price_type handling
      const typedData = data.map(project => ({
        ...project,
        price_type: project.price_type as PriceType
      }));

      // Fetch assignees for each project
      const projectsWithAssignees = await Promise.all(typedData.map(async (project) => {
        const { data: assigneesData, error: assigneesError } = await supabase
          .from('project_assignees')
          .select('user_id')
          .eq('project_id', project.id);
        
        if (assigneesError) {
          console.error('Error fetching assignees:', assigneesError);
          return project;
        }

        // Fetch profile data for each assignee
        const userIds = assigneesData.map(a => a.user_id);
        if (userIds.length === 0) {
          return { ...project, assignees: [] };
        }

        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);

        return { ...project, assignees: profilesData || [] };
      }));

      return projectsWithAssignees;
    },
    enabled: !!user,
  });

  // Fetch a single project by ID
  const getProjectById = async (projectId: string): Promise<ProjectWithRelations | null> => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        company:companies(*),
        creator:profiles!projects_created_by_fkey(*),
        milestones(*)
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      throw error;
    }

    // Type cast to ensure proper price_type handling
    const typedData = {
      ...data,
      price_type: data.price_type as PriceType
    };

    // Fetch assignees
    const { data: assigneesData, error: assigneesError } = await supabase
      .from('project_assignees')
      .select('user_id')
      .eq('project_id', projectId);
    
    if (assigneesError) {
      console.error('Error fetching assignees:', assigneesError);
      return typedData;
    }

    const userIds = assigneesData.map(a => a.user_id);
    if (userIds.length === 0) {
      return { ...typedData, assignees: [] };
    }

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    return { ...typedData, assignees: profilesData || [] };
  };

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async ({ 
      project, 
      assigneeIds 
    }: { 
      project: Omit<Project, 'id' | 'created_at' | 'updated_at'>, 
      assigneeIds: string[] 
    }) => {
      // Insert project
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();
      
      if (error) throw error;
      
      const projectId = data.id;
      
      // Create default "Project Created" milestone
      await supabase
        .from('milestones')
        .insert({
          project_id: projectId,
          name: 'Project Created',
          status: 'created',
        });
      
      // Add assignees
      if (assigneeIds.length > 0) {
        const assigneesData = assigneeIds.map(userId => ({
          project_id: projectId,
          user_id: userId,
        }));
        
        const { error: assigneesError } = await supabase
          .from('project_assignees')
          .insert(assigneesData);
        
        if (assigneesError) throw assigneesError;
      }
      
      return projectId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
  
  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ 
      projectId, 
      projectData, 
      assigneeIds 
    }: { 
      projectId: string, 
      projectData: Partial<Project>, 
      assigneeIds?: string[] 
    }) => {
      // Update project
      const { error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', projectId);
      
      if (error) throw error;
      
      // Update assignees if provided
      if (assigneeIds !== undefined) {
        // First, delete all existing assignees
        const { error: deleteError } = await supabase
          .from('project_assignees')
          .delete()
          .eq('project_id', projectId);
        
        if (deleteError) throw deleteError;
        
        // Then insert new assignees
        if (assigneeIds.length > 0) {
          const assigneesData = assigneeIds.map(userId => ({
            project_id: projectId,
            user_id: userId,
          }));
          
          const { error: assigneesError } = await supabase
            .from('project_assignees')
            .insert(assigneesData);
          
          if (assigneesError) throw assigneesError;
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      // Cascade delete should handle related records
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    isError: projectsQuery.isError,
    getProjectById,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
  };
};
