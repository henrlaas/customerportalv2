import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Plus, ClipboardList, FileInput } from 'lucide-react';
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
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';
import { CenteredSpinner } from '@/components/ui/CenteredSpinner';
import { CreateProjectContractDialog } from '@/components/Contracts/CreateProjectContractDialog';
import { CreateProjectTaskDialog } from '@/components/Projects/CreateProjectTaskDialog';
import { TaskDetailSheet } from '@/components/Tasks/TaskDetailSheet';
import { ProjectTimeTrackingTab } from '@/components/TimeTracking/ProjectTimeTrackingTab';
import { useAuth } from '@/contexts/AuthContext';
import { EditProjectDialog } from '@/components/Projects/EditProjectDialog/EditProjectDialog';
import { DeleteProjectDialog } from '@/components/Projects/DeleteProjectDialog';
import { useProjectOperations } from '@/hooks/useProjectOperations';
import { Edit, Trash2, Share, MoreHorizontal } from 'lucide-react';
import { MultiStageProjectContractDialog } from '@/components/Contracts/MultiStageProjectContractDialog';
import { ProjectOverviewTab } from '@/components/Projects/ProjectOverviewTab';
import { TaskSummaryCards } from '@/components/Projects/TaskSummaryCards';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const ProjectDetailsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { milestones } = useProjectMilestones(projectId || null);
  const { assignees } = useProjectAssignees(projectId);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const { isAdmin } = useAuth();
  const { toast: toastHook } = useToast();
  
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

  // Handle share project
  const handleShareProject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const projectUrl = `${window.location.origin}/projects/${projectId}`;
      await navigator.clipboard.writeText(projectUrl);
      toastHook({
        title: 'Link copied',
        description: 'Project link has been copied to clipboard',
      });
    } catch (error) {
      toastHook({
        title: 'Failed to copy link',
        description: 'Could not copy the project link to clipboard',
        variant: 'destructive',
      });
    }
  };

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
        
        console.log('Found tasks:', tasksData?.length, tasksData);
        
        // For each task, fetch its assignees and creator info separately using two-step approach
        const tasksWithDetails = await Promise.all((tasksData || []).map(async (task) => {
          // Step 1: Fetch assignees for this task
          const { data: assigneesData, error: assigneesError } = await supabase
            .from('task_assignees')
            .select('id, user_id')
            .eq('task_id', task.id);
            
          if (assigneesError) {
            console.error(`Error fetching assignees for task ${task.id}:`, assigneesError);
          }
            
          console.log(`Task assignees data for task ${task.id}:`, assigneesData);
          
          // Step 2: Fetch profiles for the assignees
          let profilesData = [];
          if (assigneesData && assigneesData.length > 0) {
            const userIds = assigneesData.map(assignee => assignee.user_id);
            const { data: profiles, error: profilesError } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, avatar_url')
              .in('id', userIds);
              
            if (profilesError) {
              console.error(`Error fetching profiles for task ${task.id}:`, profilesError);
            } else {
              profilesData = profiles || [];
            }
          }
            
          // Step 3: Fetch creator info if creator_id exists
          let creatorData = null;
          if (task.creator_id) {
            const { data: creator } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, avatar_url')
              .eq('id', task.creator_id)
              .single();
              
            creatorData = creator;
          }
          
          // Step 4: Combine assignees with their profile data
          const transformedAssignees = (assigneesData || []).map(assignee => {
            const profile = profilesData.find(p => p.id === assignee.user_id);
            console.log(`Processing assignee:`, assignee, 'with profile:', profile);
            return {
              id: assignee.user_id,
              first_name: profile?.first_name || null,
              last_name: profile?.last_name || null,
              avatar_url: profile?.avatar_url || null,
              user_id: assignee.user_id,
              profiles: profile
            };
          });
          
          console.log(`Transformed assignees for task ${task.id}:`, transformedAssignees);
          
          return {
            ...task,
            assignees: transformedAssignees,
            creator: creatorData
          };
        }));
        
        console.log('Final tasks with details for Overview tab:', tasksWithDetails);
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

  // Updated getTaskAssignees to use the transformed assignees data directly
  const getTaskAssignees = (task: any) => {
    console.log('getTaskAssignees called with task:', task);
    console.log('Task assignees:', task.assignees);
    
    if (!task.assignees || task.assignees.length === 0) {
      console.log('No assignees found for task');
      return [];
    }
    
    // The assignees are already transformed with profile data, so return them directly
    const taskAssignees = task.assignees.map((assignee: any) => ({
      id: assignee.id || assignee.user_id,
      first_name: assignee.first_name,
      last_name: assignee.last_name,
      avatar_url: assignee.avatar_url
    }));
    
    console.log('Processed task assignees:', taskAssignees);
    return taskAssignees;
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
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Project not found</h2>
          <p className="mb-4">The project you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/projects')}>Go to Projects</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/projects')} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <h1 className="text-2xl font-bold">{selectedProject?.name}</h1>
        </div>
        {/* Replace edit and delete buttons with action dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleShareProject}>
              <Share className="h-4 w-4 mr-2" />
              Share project
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit project
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Updated Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <ProjectOverviewTab
            project={selectedProject}
            assignees={assignees || []}
            milestones={milestones}
            tasks={projectTasks || []}
            projectId={projectId || ''}
            onCreateTask={() => setIsTaskDialogOpen(true)}
            onTaskClick={handleTaskClick}
            isAdmin={isAdmin}
          />
        </TabsContent>
        
        <TabsContent value="milestones">
          <ProjectMilestonesPanel 
            projectId={projectId || null} 
            milestones={milestones} 
          />
        </TabsContent>
        
        <TabsContent value="tasks">
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Tasks</h3>
            </div>

            {tasksError ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-red-500 mb-4">Error loading tasks. Please try again.</p>
                <Button variant="outline" onClick={() => refetchTasks()}>
                  Refresh
                </Button>
              </div>
            ) : isLoadingTasks ? (
              <CenteredSpinner />
            ) : projectTasks && projectTasks.length > 0 ? (
              <>
                {/* Task Overview Card */}
                <div className="mb-6">
                  <TaskSummaryCards tasks={projectTasks} />
                </div>
                
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-medium">Project Tasks ({projectTasks.length})</h3>
                  <Button onClick={() => setIsTaskDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Task
                  </Button>
                </div>
                <TaskListView 
                  tasks={projectTasks}
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
                />
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="mb-4 flex flex-col items-center">
                  <ClipboardList className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 mb-4">No tasks associated with this project yet.</p>
                </div>
                <Button onClick={() => setIsTaskDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Create Task
                </Button>
              </div>
            )}
          </div>
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
          ) : projectContracts && projectContracts.length > 0 ? (
            <>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium">Project Contracts ({projectContracts.length})</h3>
                {projectContracts.length < 1 && (
                  <Button onClick={() => setIsContractDialogOpen(true)}>
                    <FileInput className="mr-2 h-4 w-4" /> Create Contract
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {projectContracts.map((contract) => (
                  <Card 
                    key={contract.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleContractClick(contract.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FileInput className="h-5 w-5 text-blue-600" />
                            <h3 className="font-medium text-lg">{contract.title}</h3>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Company: {contract.company?.name}</p>
                            <p>Created: {formatDate(contract.created_at)}</p>
                          </div>
                        </div>
                        <div>{getContractStatusBadge(contract.status)}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="mb-4 flex flex-col items-center">
                <FileInput className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500 mb-4">No contracts associated with this project yet.</p>
              </div>
              <Button onClick={() => setIsContractDialogOpen(true)}>
                <FileInput className="mr-2 h-4 w-4" /> Create Contract
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Contract creation dialog */}
      {isContractDialogOpen && selectedProject && (
        <MultiStageProjectContractDialog
          isOpen={isContractDialogOpen}
          onClose={() => setIsContractDialogOpen(false)}
          projectId={projectId || ''}
          companyId={selectedProject.company_id}
          projectName={selectedProject.name}
        />
      )}

      {/* Task creation dialog */}
      {isTaskDialogOpen && selectedProject && (
        <CreateProjectTaskDialog
          isOpen={isTaskDialogOpen}
          onClose={() => setIsTaskDialogOpen(false)}
          projectId={projectId || ''}
          companyId={selectedProject.company_id}
          projectAssignees={assignees || []}
        />
      )}

      {/* Add the TaskDetailSheet component */}
      <TaskDetailSheet 
        isOpen={isTaskDetailSheetOpen} 
        onOpenChange={setIsTaskDetailSheetOpen}
        taskId={selectedTaskId}
      />

      {/* Add the edit and delete dialogs */}
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
