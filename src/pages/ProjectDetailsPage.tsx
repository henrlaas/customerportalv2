
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Building, Calendar, FileText, DollarSign, Clock, User, Briefcase, Users, Plus, ClipboardList, FileInput } from 'lucide-react';
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
import { CompanyFavicon } from '@/components/CompanyFavicon';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';
import { CenteredSpinner } from '@/components/ui/CenteredSpinner';
import { CreateProjectContractDialog } from '@/components/Contracts/CreateProjectContractDialog';
import { CreateProjectTaskDialog } from '@/components/Projects/CreateProjectTaskDialog';
import { TaskDetailSheet } from '@/components/Tasks/TaskDetailSheet';
import { ProjectTimeTrackingTab } from '@/components/TimeTracking/ProjectTimeTrackingTab';
import { ProjectFinancialChart } from '@/components/Projects/ProjectFinancialChart';
import { useAuth } from '@/contexts/AuthContext';

const ProjectDetailsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { milestones } = useProjectMilestones(projectId || null);
  const { assignees } = useProjectAssignees(projectId);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [projectCardTab, setProjectCardTab] = useState<'info' | 'finance'>('info');
  const { isAdmin } = useAuth(); // Get the user role from auth context
  
  // Add state for task detail sheet
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskDetailSheetOpen, setIsTaskDetailSheetOpen] = useState(false);

  // Get selected project details
  const selectedProject = projects?.find(p => p.id === projectId);

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

  // Format currency for display
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Not specified';
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Calculate project profit/loss
  const calculateProjectProfit = () => {
    const projectValue = selectedProject?.value || 0;
    const totalCost = financialData?.totalCost || 0;
    const profit = projectValue - totalCost;
    const profitPercentage = projectValue ? (profit / projectValue) * 100 : 0;
    
    return {
      profit,
      profitPercentage
    };
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

  // Format price type for display
  const formatPriceType = (priceType: string | null) => {
    if (!priceType) return 'Not specified';
    
    // Convert snake_case to Title Case
    return priceType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
      </div>
      
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-lg border-t-4 border-t-primary mb-6 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Briefcase className="h-5 w-5 text-primary" />
            Project Information
            <div className="ml-auto">
              <div className="flex items-center mr-2 bg-muted rounded-md p-1">
                <button
                  onClick={() => setProjectCardTab('info')}
                  className={`px-3 py-1 rounded-sm text-sm ${
                    projectCardTab === 'info' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  Information
                </button>
                {/* Only show Finance tab button if user is admin */}
                {isAdmin && (
                  <button
                    onClick={() => setProjectCardTab('finance')}
                    className={`px-3 py-1 rounded-sm text-sm ${
                      projectCardTab === 'finance' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    Finance
                  </button>
                )}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Information Tab */}
            {projectCardTab === 'info' && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Company</p>
                      <div className="flex items-center gap-2">
                        {selectedProject?.company && (
                          <CompanyFavicon 
                            companyName={selectedProject.company.name} 
                            website={selectedProject.company.website}
                            size="sm"
                          />
                        )}
                        <span className="font-semibold">{selectedProject?.company?.name || 'Not assigned'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Description</p>
                      <p className="text-gray-800">{selectedProject?.description || 'No description provided'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Value</p>
                      <p className="text-gray-800 font-semibold">
                        {selectedProject?.value ? (
                          `${selectedProject.value.toLocaleString()} NOK`
                        ) : (
                          'Not specified'
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-indigo-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Team Members</p>
                      {assignees && assignees.length > 0 ? (
                        <div className="mt-1">
                          <UserAvatarGroup
                            users={assignees.map(assignee => ({
                              id: assignee.user_id,
                              first_name: assignee.profiles?.first_name,
                              last_name: assignee.profiles?.last_name,
                              avatar_url: assignee.profiles?.avatar_url
                            }))}
                            size="md"
                          />
                          <div className="mt-1 text-xs text-gray-500">
                            {assignees.length} {assignees.length === 1 ? 'member' : 'members'} assigned
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600">No team members assigned</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-orange-600 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Price Type</p>
                      <p className="text-gray-800">{formatPriceType(selectedProject?.price_type)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-red-600 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Deadline</p>
                      <p className="text-gray-800">{selectedProject?.deadline ? formatDate(selectedProject.deadline) : 'No deadline set'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-purple-600 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Created</p>
                      <p className="text-gray-800">{formatDate(selectedProject?.created_at)}</p>
                    </div>
                  </div>

                  {selectedProject?.creator && (
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-indigo-600 shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Created By</p>
                        <p className="text-gray-800">
                          {`${selectedProject.creator.first_name || ''} ${selectedProject.creator.last_name || ''}`.trim() || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Finance Tab - Only render if user is admin */}
            {projectCardTab === 'finance' && isAdmin && (
              <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col justify-center">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Project Value Card */}
                      <div className="bg-white rounded-md p-4 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 font-medium">Project Value</div>
                        <div className="text-2xl font-bold">
                          {formatCurrency(selectedProject?.value)}
                        </div>
                      </div>
                      
                      {/* Cost to Date Card */}
                      <div className="bg-white rounded-md p-4 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 font-medium">Cost to Date</div>
                        <div className="text-2xl font-bold">
                          {isLoadingFinancial ? (
                            <span className="text-lg">Loading...</span>
                          ) : (
                            formatCurrency(financialData?.totalCost || 0)
                          )}
                        </div>
                      </div>
                      
                      {/* Projected Profit Card */}
                      <div className="bg-white rounded-md p-4 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 font-medium">Projected Profit</div>
                        {isLoadingFinancial ? (
                          <span className="text-lg">Loading...</span>
                        ) : (
                          <div className="text-2xl font-bold">
                            <span className={calculateProjectProfit().profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(calculateProjectProfit().profit)} 
                              ({calculateProjectProfit().profitPercentage.toFixed(0)}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center items-center">
                  <div className="w-full h-full">
                    <ProjectFinancialChart 
                      projectId={projectId || ''} 
                      projectValue={selectedProject?.value || null}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Updated Tabs */}
      <Tabs defaultValue="milestones">
        <TabsList>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="time">Time Entries</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>
        
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
          ) : projectTasks && projectTasks.length > 0 ? (
            <>
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
        <CreateProjectContractDialog
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
    </div>
  );
};

// Format price type for display
const formatPriceType = (priceType: string | null) => {
  if (!priceType) return 'Not specified';
  
  // Convert snake_case to Title Case
  return priceType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default ProjectDetailsPage;
