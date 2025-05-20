
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCreateDialog } from '@/components/Projects/ProjectCreateDialog';
import { ProjectListView } from '@/components/Projects/ProjectListView';
import { ProjectsSummaryCards } from '@/components/Projects/ProjectsSummaryCards';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ProjectsPage = () => {
  const { profile } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filter, setFilter] = useState<'all' | 'signed' | 'unsigned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { projects, isLoading: projectsLoading, refetch } = useProjects();

  // Filter projects based on contract status and search query
  const filteredProjects = projects ? projects.filter(project => {
    // First apply status filter
    if (filter !== 'all') {
      // Note: This is a placeholder - we would need to implement contract status tracking in projects
      // For now, we're treating all projects as unsigned
      if (filter === 'signed') return false;
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
    const { deleteProject } = useProjects();
    
    try {
      await deleteProject(projectId);
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
      
      {/* Search and Filters row - styled like the Contracts page */}
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
                onClick={() => setFilter('unsigned')}
                className={`pb-2 px-1 text-sm font-medium ${filter === 'unsigned' ? 'text-evergreen border-b-2 border-evergreen' : 'text-muted-foreground'}`}
              >
                Unsigned
              </button>
              <button
                onClick={() => setFilter('signed')}
                className={`pb-2 px-1 text-sm font-medium ${filter === 'signed' ? 'text-evergreen border-b-2 border-evergreen' : 'text-muted-foreground'}`}
              >
                Signed
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
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Loading projects...</p>
        </div>
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
                  : filter === 'signed' 
                    ? 'No signed projects found.' 
                    : 'No unsigned projects found.'}
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
