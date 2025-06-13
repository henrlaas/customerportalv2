
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCreateDialog } from '@/components/Projects/ProjectCreateDialog';
import { ProjectListView } from '@/components/Projects/ProjectListView';
import { ProjectListViewSkeleton } from '@/components/Projects/ProjectListViewSkeleton';
import { ProjectsSummaryCards } from '@/components/Projects/ProjectsSummaryCards';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getProjectStatus } from '@/utils/projectStatus';

const ProjectsPage = () => {
  const { profile } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { projects, isLoading: projectsLoading, refetch, deleteProject } = useProjects();

  // Fetch milestones for all projects to enable status filtering
  const { data: projectMilestones = {} } = useQuery({
    queryKey: ['all-project-milestones', projects?.map(p => p.id)],
    queryFn: async () => {
      if (!projects?.length) return {};
      
      const projectIds = projects.map(project => project.id);
      
      try {
        const { data: milestonesData, error: milestonesError } = await supabase
          .from('milestones')
          .select('id, project_id, status, name, due_date, created_at, updated_at')
          .in('project_id', projectIds);
        
        if (milestonesError) {
          console.error('Error fetching project milestones:', milestonesError);
          return {};
        }
        
        // Group milestones by project_id
        const milestonesByProject: Record<string, any[]> = {};
        for (const milestone of milestonesData || []) {
          if (!milestonesByProject[milestone.project_id]) {
            milestonesByProject[milestone.project_id] = [];
          }
          milestonesByProject[milestone.project_id].push(milestone);
        }
        
        return milestonesByProject;
      } catch (error) {
        console.error('Error in project milestones query:', error);
        return {};
      }
    },
    enabled: !!projects?.length,
    staleTime: 30000, // 30 seconds
    retry: 2
  });

  // Filter projects based on milestone status and search query
  const filteredProjects = projects ? projects.filter(project => {
    // First apply status filter
    if (filter !== 'all') {
      const milestones = projectMilestones[project.id] || [];
      const projectStatus = getProjectStatus(milestones);
      
      if (filter === 'completed' && projectStatus !== 'completed') return false;
      if (filter === 'in_progress' && projectStatus !== 'in_progress') return false;
    }
    
    // Then apply search filter if there's a search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return project.name.toLowerCase().includes(query) || 
             project.description?.toLowerCase().includes(query) ||
             project.company?.name.toLowerCase().includes(query);
    }
    
    return true;
  }) : [];

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      toast.success('Project and associated contracts successfully deleted');
      refetch(); // Refresh the projects list after deletion
      return Promise.resolve();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
      return Promise.reject(error);
    }
  };

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
      </div>
      
      {/* Summary Cards */}
      <ProjectsSummaryCards projects={projects} isLoading={projectsLoading} />
      
      {/* Search and Filters row */}
      <div className="flex justify-between items-center my-6">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search projects..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4">
          {/* Filter tabs with green underline styling */}
          <div className="border-b border-border">
            <nav className="flex space-x-6" aria-label="Filter">
              <button
                onClick={() => setFilter('all')}
                className={`pb-2 px-1 text-sm font-medium ${filter === 'all' ? 'text-evergreen border-b-2 border-evergreen' : 'text-muted-foreground'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('in_progress')}
                className={`pb-2 px-1 text-sm font-medium ${filter === 'in_progress' ? 'text-evergreen border-b-2 border-evergreen' : 'text-muted-foreground'}`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`pb-2 px-1 text-sm font-medium ${filter === 'completed' ? 'text-evergreen border-b-2 border-evergreen' : 'text-muted-foreground'}`}
              >
                Completed
              </button>
            </nav>
          </div>

          {(profile?.role === 'admin' || profile?.role === 'employee') && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      </div>
      
      {/* Projects List */}
      {projectsLoading ? (
        <ProjectListViewSkeleton />
      ) : filteredProjects && filteredProjects.length > 0 ? (
        <ProjectListView 
          projects={filteredProjects} 
          selectedProjectId={null}
          onDeleteProject={handleDeleteProject}
        />
      ) : (
        <Card className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">
              {searchQuery 
                ? 'No matching projects found. Try a different search term.'
                : filter === 'all' 
                  ? 'No projects created yet. Projects will appear here once created.' 
                  : filter === 'completed' 
                    ? 'No completed projects found.' 
                    : 'No projects in progress found.'}
            </p>
          </div>
        </Card>
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
