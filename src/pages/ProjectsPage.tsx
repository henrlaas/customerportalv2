
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlusIcon, ClockIcon, FileTextIcon } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCreateDialog } from '@/components/Projects/ProjectCreateDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectMilestonesPanel } from '@/components/Projects/ProjectMilestonesPanel';
import { useProjectMilestones } from '@/hooks/useProjectMilestones';
import { ProjectListView } from '@/components/Projects/ProjectListView';
import { ProjectsSummaryCards } from '@/components/Projects/ProjectsSummaryCards';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const ProjectsPage = () => {
  const { profile } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'signed' | 'unsigned'>('all');
  const { projects, isLoading: projectsLoading } = useProjects();
  const { milestones } = useProjectMilestones(selectedProjectId);

  // Function to handle clicking on a project
  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId === selectedProjectId ? null : projectId);
  };

  // Filter projects based on contract status
  const filteredProjects = projects ? projects.filter(project => {
    if (filter === 'all') return true;
    
    // Note: This is a placeholder - we would need to implement contract status tracking in projects
    // For now, we're treating all projects as unsigned
    return filter === 'unsigned';
  }) : [];

  // Get selected project details
  const selectedProject = projects?.find(p => p.id === selectedProjectId);

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
      </div>
      
      {/* Summary Cards */}
      <ProjectsSummaryCards projects={projects} isLoading={projectsLoading} />
      
      {/* Filters and Create Button in same row, styled like the Contracts page */}
      <div className="flex justify-between items-center my-6">
        <ToggleGroup type="single" value={filter} onValueChange={(value) => value && setFilter(value as 'all' | 'signed' | 'unsigned')}>
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="signed">Signed</ToggleGroupItem>
          <ToggleGroupItem value="unsigned">Unsigned</ToggleGroupItem>
        </ToggleGroup>

        {(profile?.role === 'admin' || profile?.role === 'employee') && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        )}
      </div>
      
      {/* Projects List */}
      {projectsLoading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Loading projects...</p>
        </div>
      ) : filteredProjects && filteredProjects.length > 0 ? (
        <ProjectListView 
          projects={filteredProjects} 
          onProjectSelect={handleProjectSelect} 
          selectedProjectId={selectedProjectId}
        />
      ) : (
        <Card className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'No projects created yet. Projects will appear here once created.' 
                : filter === 'signed' 
                  ? 'No signed projects found.' 
                  : 'No unsigned projects found.'}
            </p>
          </div>
        </Card>
      )}

      {/* Project Details Panel */}
      {selectedProject && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">{selectedProject.name} - Details</h2>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Project Information</h3>
                <p className="text-gray-700 mb-1"><span className="font-medium">Company:</span> {selectedProject.company?.name}</p>
                <p className="text-gray-700 mb-1"><span className="font-medium">Description:</span> {selectedProject.description}</p>
                <p className="text-gray-700 mb-1"><span className="font-medium">Value:</span> {selectedProject.value} NOK</p>
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
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = `/tasks?projectId=${selectedProject.id}`}>
                    <FileTextIcon className="mr-2 h-4 w-4" />
                    View Associated Tasks
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = `/time-tracking?projectId=${selectedProject.id}`}>
                    <ClockIcon className="mr-2 h-4 w-4" />
                    View Time Entries
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = `/contracts?projectId=${selectedProject.id}`}>
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
                projectId={selectedProjectId} 
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
      )}

      {/* Create Project Dialog */}
      <ProjectCreateDialog 
        isOpen={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)} 
      />
    </div>
  );
};

export default ProjectsPage;
