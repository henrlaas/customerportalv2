
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useProjectMilestones } from '@/hooks/useProjectMilestones';
import { useProjectAssignees } from '@/hooks/useProjectAssignees';
import { ProjectMilestonesPanel } from '@/components/Projects/ProjectMilestonesPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { TaskListView } from '@/components/Tasks/TaskListView';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CenteredSpinner } from '@/components/ui/CenteredSpinner';
import { CreateProjectContractDialog } from '@/components/Contracts/CreateProjectContractDialog';
import { CreateProjectTaskDialog } from '@/components/Projects/CreateProjectTaskDialog';
import { TaskDetailSheet } from '@/components/Tasks/TaskDetailSheet';
import { ProjectTimeTrackingTab } from '@/components/TimeTracking/ProjectTimeTrackingTab';
import { useAuth } from '@/contexts/AuthContext';
import { EditProjectDialog } from '@/components/Projects/EditProjectDialog/EditProjectDialog';
import { DeleteProjectDialog } from '@/components/Projects/DeleteProjectDialog';
import { useProjectOperations } from '@/hooks/useProjectOperations';
import { MultiStageProjectContractDialog } from '@/components/Contracts/MultiStageProjectContractDialog';
import { ProjectOverviewTab } from '@/components/Projects/ProjectOverviewTab';
import { ProjectDocumentsTab } from '@/components/Projects/ProjectDocumentsTab';

const ProjectDetailsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { milestones } = useProjectMilestones(projectId || null);
  const { assignees } = useProjectAssignees(projectId);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const { isAdmin } = useAuth();
  
  // Add state for edit and delete dialogs
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Add state for task detail sheet
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDetailSheetOpen, setIsTaskDetailSheetOpen] = useState(false);

  // Get project operations hook
  const { updateProject, deleteProject } = useProjectOperations();

  // Find the selected project from the projects array
  const selectedProject = projects?.find(project => project.id === projectId);

  // Fetch tasks related to this project
  const { data: projectTasks, isLoading: isLoadingTasks, error: tasksError, refetch: refetchTasks } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      console.log('Fetching tasks for project ID:', projectId);
      
      try {
        // First fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
        
        if (tasksError) {
          console.error('Error fetching project tasks:', tasksError);
          toast.error('Failed to load tasks');
          throw tasksError;
        }
        
        // Debug the returned tasks
        console.log('Found tasks:', tasksData?.length, tasksData);
        
        // For each task, fetch its assignees and creator info separately
        const tasksWithDetails = await Promise.all((tasksData || []).map(async (task) => {
          // Fetch assignees for this task
          const { data: assigneesData } = await supabase
            .from('task_assignees')
            .select('id, user_id')
            .eq('task_id', task.id);
            
          // Fetch creator info if creator_id exists
          let creatorData = null;
          if (task.creator_id) {
            const { data: creator } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, avatar_url')
              .eq('id', task.creator_id)
              .single();
              
            creatorData = creator;
          }
          
          return {
            ...task,
            assignees: assigneesData || [],
            creator: creatorData
          };
        }));
        
        return tasksWithDetails || [];
      } catch (error) {
        console.error('Error in project tasks query:', error);
        return [];
      }
    },
    enabled: !!projectId
  });

  // Fetch contracts related to this project
  const { data: projectContracts, isLoading: isLoadingContracts, error: contractsError } = useQuery({
    queryKey: ['project-contracts', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      try {
        const { data, error } = await supabase
          .from('contracts')
          .select(`
            *,
            company:company_id (name, organization_number),
            contact:contact_id (id, user_id, position)
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching project contracts:', error);
          toast.error('Failed to load contracts');
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('Error in project contracts query:', error);
        return [];
      }
    },
    enabled: !!projectId
  });

  // Fetch profiles for task assignees
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url');
        
        if (error) {
          console.error('Error fetching profiles:', error);
          toast.error('Failed to load user profiles');
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('Error in profiles query:', error);
        return [];
      }
    }
  });

  // Fetch project financial data
  const { data: financialData, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ['project-financial-data', projectId],
    queryFn: async () => {
      if (!projectId) return { totalHours: 0, totalCost: 0 };

      // Get time entries for this project
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select(`
          id,
          start_time,
          end_time,
          user_id,
          is_billable
        `)
        .eq('project_id', projectId);

      if (timeError) {
        console.error('Error fetching time entries:', timeError);
        throw timeError;
      }

      // Calculate time spent and cost
      let totalCost = 0;
      let totalHours = 0;

      if (timeEntries && timeEntries.length > 0) {
        // Get all unique user IDs
        const userIds = [...new Set(timeEntries.map(entry => entry.user_id))];

        // Fetch employee data for these users to get hourly rates
        const { data: employees, error: empError } = await supabase
          .from('employees')
          .select('id, hourly_salary')
          .in('id', userIds);

        if (empError) {
          console.error('Error fetching employee data:', empError);
          throw empError;
        }

        // Create map of user_id to hourly_salary
        const hourlyRates: Record<string, number> = {};
        employees?.forEach(emp => {
          hourlyRates[emp.id] = emp.hourly_salary;
        });

        // Calculate total costs
        timeEntries.forEach(entry => {
          const startTime = new Date(entry.start_time);
          const endTime = entry.end_time ? new Date(entry.end_time) : new Date();
          const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          const hourlyRate = hourlyRates[entry.user_id] || 0;
          const cost = hours * hourlyRate;

          totalHours += hours;
          totalCost += cost;
        });
      }

      return {
        totalHours,
        totalCost
      };
    },
    enabled: !!projectId,
  });

  // Helper functions for the TaskListView component
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">To Do</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTaskAssignees = (task: any) => {
    if (!task.assignees) return [];
    
    return task.assignees.map((assignee: any) => {
      const profile = profiles.find((p: any) => p.id === assignee.user_id);
      return profile || { id: assignee.user_id };
    });
  };

  const getCampaignName = (campaignId: string | null) => {
    return campaignId ? "Campaign" : "";
  };

  const getProjectName = (projectId: string | null) => {
    return selectedProject?.name || "";
  };

  // Update the task click handler to open the task detail sheet instead of navigating
  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskDetailSheetOpen(true);
  };

  // Function to handle contract click
  const handleContractClick = (contractId: string) => {
    navigate(`/contracts/${contractId}`);
  };

  // Format contract status for display
  const getContractStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Signed</Badge>;
      case 'unsigned':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Unsigned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle edit project
  const handleEditProject = (data: any) => {
    if (!projectId) return;
    
    updateProject.mutate(
      { projectId, data },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
        }
      }
    );
  };

  // Handle delete project
  const handleDeleteProject = () => {
    if (!projectId) return;
    
    deleteProject.mutate(projectId, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        navigate('/projects');
      }
    });
  };

  if (!selectedProject) {
    return (
      <div className="container p-6 mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/projects')} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Project not found</h2>
          <p className="mb-4">The project you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/projects')}>Go to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/projects')} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedProject?.name}</h1>
            <p className="text-gray-500">{selectedProject?.company?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <ProjectOverviewTab
            project={selectedProject}
            assignees={assignees || []}
            tasks={projectTasks || []}
            financialData={financialData}
            isLoadingFinancial={isLoadingFinancial}
            onTaskClick={handleTaskClick}
          />
        </TabsContent>
        
        <TabsContent value="milestones">
          <ProjectMilestonesPanel 
            projectId={projectId || null} 
            milestones={milestones} 
          />
        </TabsContent>
        
        <TabsContent value="tasks">
          {tasksError ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-red-500 mb-4">Error loading tasks. Please try again.</p>
              <Button variant="outline" onClick={() => refetchTasks()}>
                Refresh
              </Button>
            </div>
          ) : isLoadingTasks ? (
            <CenteredSpinner />
          ) : (
            <TaskListView 
              tasks={projectTasks || []}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              getTaskAssignees={getTaskAssignees}
              getCampaignName={getCampaignName}
              profiles={profiles}
              companies={[]}
              onTaskClick={handleTaskClick}
              getProjectName={getProjectName}
              hideCompanyColumn={true}
              hideCampaignProjectColumn={true}
              showCreateButton={true}
              onCreateTask={() => setIsTaskDialogOpen(true)}
            />
          )}
        </TabsContent>
        
        <TabsContent value="time">
          <ProjectTimeTrackingTab 
            projectId={projectId || ''} 
            companyId={selectedProject?.company_id} 
          />
        </TabsContent>
        
        <TabsContent value="contracts">
          {contractsError ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-red-500 mb-4">Error loading contracts. Please try again.</p>
              <Button variant="outline" onClick={() => refetchTasks()}>
                Refresh
              </Button>
            </div>
          ) : isLoadingContracts ? (
            <CenteredSpinner />
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Project Contracts ({projectContracts?.length || 0})</h3>
                <Button onClick={() => setIsContractDialogOpen(true)}>
                  Create Contract
                </Button>
              </div>
              
              {projectContracts && projectContracts.length > 0 ? (
                <div className="space-y-4">
                  {projectContracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="p-6 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleContractClick(contract.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h3 className="font-medium text-lg">{contract.title}</h3>
                          <div className="text-sm text-gray-600">
                            <p>Company: {contract.company?.name}</p>
                            <p>Created: {formatDate(contract.created_at)}</p>
                          </div>
                        </div>
                        <div>{getContractStatusBadge(contract.status)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-gray-500 mb-4">No contracts associated with this project yet.</p>
                  <Button onClick={() => setIsContractDialogOpen(true)}>
                    Create Contract
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents">
          <ProjectDocumentsTab projectId={projectId || ''} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {isContractDialogOpen && selectedProject && (
        <MultiStageProjectContractDialog
          isOpen={isContractDialogOpen}
          onClose={() => setIsContractDialogOpen(false)}
          projectId={projectId || ''}
          companyId={selectedProject.company_id}
          projectName={selectedProject.name}
        />
      )}

      {isTaskDialogOpen && selectedProject && (
        <CreateProjectTaskDialog
          isOpen={isTaskDialogOpen}
          onClose={() => setIsTaskDialogOpen(false)}
          projectId={projectId || ''}
          companyId={selectedProject.company_id}
          projectAssignees={assignees || []}
        />
      )}

      <TaskDetailSheet 
        isOpen={isTaskDetailSheetOpen} 
        onOpenChange={setIsTaskDetailSheetOpen}
        taskId={selectedTaskId}
      />

      {selectedProject && (
        <>
          <EditProjectDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSave={handleEditProject}
            project={selectedProject}
            assignees={assignees || []}
            isLoading={updateProject.isPending}
          />

          <DeleteProjectDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleDeleteProject}
            projectName={selectedProject.name}
            isDeleting={deleteProject.isPending}
          />
        </>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
