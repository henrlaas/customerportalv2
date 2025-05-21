
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Building, Calendar, FileText, DollarSign, Clock, User, Briefcase, Users, Plus, ClipboardList } from 'lucide-react';
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

const ProjectDetailsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { milestones } = useProjectMilestones(projectId || null);
  const { assignees } = useProjectAssignees(projectId);

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

  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Button 
                  onClick={() => navigate('/tasks/new?projectId=' + projectId)}
                >
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
              <Button 
                onClick={() => navigate('/tasks/new?projectId=' + projectId)}
              >
                <Plus className="mr-2 h-4 w-4" /> Create Task
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="time">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-center text-gray-500">Time tracking entries for this project will appear here.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="contracts">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-center text-gray-500">Contracts related to this project will appear here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetailsPage;
