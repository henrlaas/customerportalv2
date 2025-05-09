
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { useMilestones } from '@/hooks/useMilestones';
import { useProjectAssignees } from '@/hooks/useProjectAssignees';

// Components
import ProjectList from '@/components/Projects/ProjectList';
import ProjectDetails from '@/components/Projects/ProjectDetails';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { ChevronRight } from 'lucide-react';

const ProjectsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, isAdmin, isEmployee } = useAuth();
  const [editMode, setEditMode] = useState(false);

  // Fetch all companies for dropdown in create dialog
  const { data: companies, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch projects
  const { 
    projects, 
    isLoading: isLoadingProjects,
  } = useProjects();

  // If viewing a specific project
  const selectedProject = projectId && projects ? 
    projects.find(p => p.id === projectId) : 
    undefined;

  // Fetch milestones for the selected project
  const {
    milestones,
    isLoading: isLoadingMilestones,
    createMilestone,
    updateMilestone
  } = useMilestones(projectId);

  // Fetch assignees for the selected project
  const {
    assignees,
    isLoading: isLoadingAssignees,
  } = useProjectAssignees(projectId);

  // Fetch contract for the selected project
  const { data: contract, isLoading: isLoadingContract } = useQuery({
    queryKey: ['project-contract', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('id, title, status')
        .eq('project_id', projectId!)
        .maybeSingle();
        
      if (error) throw error;
      
      // Ensure status is strictly "signed" or "unsigned"
      if (data) {
        return {
          ...data,
          status: data.status === 'signed' ? 'signed' : 'unsigned'
        } as { id: string; title: string; status: 'signed' | 'unsigned' };
      }
      
      return null;
    },
    enabled: !!projectId
  });

  // Fetch tasks for the selected project
  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, status, priority')
        .eq('project_id', projectId!);
        
      if (error) throw error;
      return data;
    },
    enabled: !!projectId
  });

  // Handle milestone creation
  const handleCreateMilestone = async (data: { name: string; due_date?: string }) => {
    if (!projectId) return;
    
    await createMilestone.mutateAsync({
      project_id: projectId,
      name: data.name,
      status: 'created',
      due_date: data.due_date
    });
  };

  // Handle milestone status update
  const handleUpdateMilestoneStatus = async (id: string, status: 'created' | 'completed') => {
    await updateMilestone.mutateAsync({
      id,
      status
    });
  };

  // Loading state
  const isLoading = isLoadingProjects || isLoadingCompanies;

  // Check if user can edit the project (admin/employee)
  const canEdit = isAdmin || isEmployee;

  return (
    <div className="container mx-auto p-6">
      {/* Breadcrumb navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          {projectId ? (
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          ) : (
            <BreadcrumbLink>Projects</BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {projectId && selectedProject && (
          <BreadcrumbItem>
            <BreadcrumbLink>{selectedProject.name}</BreadcrumbLink>
          </BreadcrumbItem>
        )}
      </Breadcrumb>

      {/* Project list or details */}
      {projectId && selectedProject ? (
        <ProjectDetails 
          project={selectedProject}
          milestones={milestones}
          isLoadingMilestones={isLoadingMilestones}
          onCreateMilestone={handleCreateMilestone}
          onUpdateMilestoneStatus={handleUpdateMilestoneStatus}
          assignees={assignees}
          canEdit={canEdit}
          contract={contract}
          tasks={tasks}
          onEditProject={() => setEditMode(true)}
        />
      ) : (
        <ProjectList 
          projects={projects}
          isLoading={isLoading}
          companies={companies || []}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
