
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useProjectMilestones } from '@/hooks/useProjectMilestones';
import { ProjectMilestonesPanel } from '@/components/Projects/ProjectMilestonesPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { TaskListView } from '@/components/Tasks/TaskListView';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const ProjectDetailsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { milestones } = useProjectMilestones(projectId || null);

  // Get selected project details
  const selectedProject = projects?.find(p => p.id === projectId);

  // Fetch tasks related to this project
  const { data: projectTasks, isLoading: isLoadingTasks, error: tasksError, refetch: refetchTasks } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      console.log('Fetching tasks for project ID:', projectId);
      
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            *,
            assignees:task_assignees(id, user_id),
            creator:profiles!tasks_creator_id_fkey(id, first_name, last_name, avatar_url)
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching project tasks:', error);
          toast.error('Failed to load tasks');
          throw error;
        }
        
        // Debug the returned tasks
        console.log('Found tasks:', data?.length, data);
        
        // Additional check to verify project_id matches
        if (data && data.length > 0) {
          console.log('Task project IDs:', data.map(task => task.project_id));
        }
        
        return data || [];
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
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Project Information</h3>
            <p className="text-gray-700 mb-1"><span className="font-medium">Company:</span> {selectedProject?.company?.name}</p>
            <p className="text-gray-700 mb-1"><span className="font-medium">Description:</span> {selectedProject?.description}</p>
            <p className="text-gray-700 mb-1"><span className="font-medium">Value:</span> {selectedProject?.value?.toLocaleString() || 'N/A'} NOK</p>
            <p className="text-gray-700 mb-1"><span className="font-medium">Price Type:</span> {selectedProject?.price_type}</p>
            {selectedProject?.deadline && (
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Deadline:</span> {new Date(selectedProject.deadline).toLocaleDateString()}
              </p>
            )}
            <p className="text-gray-700 mb-1">
              <span className="font-medium">Created:</span> {selectedProject && new Date(selectedProject.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

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
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : projectTasks && projectTasks.length > 0 ? (
            <>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium">Project Tasks ({projectTasks.length})</h3>
                <Button 
                  onClick={() => navigate('/tasks/new?projectId=' + projectId)}
                >
                  Create Task
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
              <p className="text-gray-500 mb-4">No tasks associated with this project yet.</p>
              <Button 
                onClick={() => navigate('/tasks/new?projectId=' + projectId)}
              >
                Create a Task
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
