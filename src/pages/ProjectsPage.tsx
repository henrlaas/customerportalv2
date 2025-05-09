
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { ProjectList } from '@/components/Projects/ProjectList';
import { ProjectCreateDialog, ProjectFormValues } from '@/components/Projects/ProjectCreateDialog';
import { Project } from '@/types/project';
import contractService from '@/services/contractService';

const ProjectsPage = () => {
  const { user, isAdmin, isEmployee, isClient } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const { 
    projects, 
    isLoading, 
    createProject, 
    updateProject, 
    deleteProject 
  } = useProjects();

  const handleCreateProject = async (
    projectData: ProjectFormValues,
    assigneeIds: string[]
  ) => {
    if (!user) return;

    try {
      const projectId = await createProject(
        { project: { ...projectData, created_by: user.id }, assigneeIds },
        {
          onSuccess: async (newProjectId) => {
            toast({
              title: "Project Created",
              description: "New project has been created successfully."
            });
            
            // Generate contract for the project
            try {
              await contractService.createContractFromProject(newProjectId, user.id);
              toast({
                title: "Contract Generated",
                description: "A contract has been automatically generated for this project."
              });
            } catch (contractError) {
              console.error("Failed to generate contract:", contractError);
              toast({
                title: "Contract Generation Failed",
                description: "The project was created, but we couldn't generate a contract automatically.",
                variant: "destructive",
              });
            }
          },
          onError: (error) => {
            toast({
              title: "Error",
              description: "Failed to create project. Please try again.",
              variant: "destructive",
            });
            console.error("Project creation error:", error);
          }
        }
      );
    } catch (error) {
      console.error("Error in handleCreateProject:", error);
    }
  };

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId, {
      onSuccess: () => {
        toast({
          title: "Project Deleted",
          description: "The project has been deleted successfully."
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to delete project. Please try again.",
          variant: "destructive",
        });
        console.error("Project deletion error:", error);
      }
    });
  };

  const canCreate = isAdmin || isEmployee;

  return (
    <div className="container p-6 mx-auto">
      <ProjectList
        projects={projects}
        isLoading={isLoading}
        canCreate={canCreate}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
        onCreateNew={() => setIsCreateDialogOpen(true)}
      />

      <ProjectCreateDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

export default ProjectsPage;
