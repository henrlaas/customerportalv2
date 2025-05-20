
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileTextIcon, ClockIcon, ArrowLeft } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useProjectMilestones } from '@/hooks/useProjectMilestones';
import { ProjectMilestonesPanel } from '@/components/Projects/ProjectMilestonesPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProjectDetailsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { milestones } = useProjectMilestones(projectId || null);

  // Get selected project details
  const selectedProject = projects?.find(p => p.id === projectId);

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
          <h1 className="text-2xl font-bold">{selectedProject.name}</h1>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Project Information</h3>
            <p className="text-gray-700 mb-1"><span className="font-medium">Company:</span> {selectedProject.company?.name}</p>
            <p className="text-gray-700 mb-1"><span className="font-medium">Description:</span> {selectedProject.description}</p>
            <p className="text-gray-700 mb-1"><span className="font-medium">Value:</span> {selectedProject.value?.toLocaleString() || 'N/A'} NOK</p>
            <p className="text-gray-700 mb-1"><span className="font-medium">Price Type:</span> {selectedProject.price_type}</p>
            {selectedProject.deadline && (
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Deadline:</span> {new Date(selectedProject.deadline).toLocaleDateString()}
              </p>
            )}
            <p className="text-gray-700 mb-1">
              <span className="font-medium">Created:</span> {new Date(selectedProject.created_at).toLocaleDateString()}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/tasks?projectId=${selectedProject.id}`)}>
                <FileTextIcon className="mr-2 h-4 w-4" />
                View Associated Tasks
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/time-tracking?projectId=${selectedProject.id}`)}>
                <ClockIcon className="mr-2 h-4 w-4" />
                View Time Entries
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/contracts?projectId=${selectedProject.id}`)}>
                <FileTextIcon className="mr-2 h-4 w-4" />
                View Contracts
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones and Tasks Tabs */}
      <Tabs defaultValue="milestones">
        <TabsList>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="milestones">
          <ProjectMilestonesPanel 
            projectId={projectId || null} 
            milestones={milestones} 
          />
        </TabsContent>
        
        <TabsContent value="tasks">
          <div className="bg-white rounded-lg shadow p-6">
            <p>Associated tasks will appear here. Click 'View Associated Tasks' to see all tasks.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="time">
          <div className="bg-white rounded-lg shadow p-6">
            <p>Time tracking information will appear here. Click 'View Time Entries' to see all entries.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetailsPage;
