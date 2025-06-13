
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCreateDialog } from '@/components/Projects/ProjectCreateDialog';
import { ProjectListView } from '@/components/Projects/ProjectListView';
import { ProjectListViewSkeleton } from '@/components/Projects/ProjectListViewSkeleton';
import { ProjectsSummaryCards } from '@/components/Projects/ProjectsSummaryCards';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getProjectStatus } from '@/utils/projectStatus';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

const ProjectsPage = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyProjects, setShowMyProjects] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { projects, isLoading: projectsLoading, refetch, deleteProject } = useProjects();

  console.log('ProjectsPage render - projects:', projects?.length || 0, 'loading:', projectsLoading);

  // Force refresh on page load to avoid cache issues
  useEffect(() => {
    console.log('ProjectsPage mounted - forcing data refresh');
    // Invalidate all projects-related queries
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['user-project-assignments'] });
    queryClient.invalidateQueries({ queryKey: ['all-project-milestones'] });
    
    // Force refetch
    refetch();
  }, [queryClient, refetch]);

  // Fetch user's assigned projects with better error handling
  const { data: userProjectIds = [], isLoading: userProjectsLoading, error: userProjectsError } = useQuery({
    queryKey: ['user-project-assignments', profile?.id],
    queryFn: async () => {
      if (!profile?.id) {
        console.log('No profile ID available for user project assignments');
        return [];
      }
      
      console.log('Fetching user project assignments for:', profile.id);
      
      try {
        const { data: assignmentsData, error } = await supabase
          .from('project_assignees')
          .select('project_id')
          .eq('user_id', profile.id);
        
        if (error) {
          console.error('Error fetching user project assignments:', error);
          throw error;
        }
        
        const projectIds = assignmentsData?.map(a => a.project_id) || [];
        console.log('User project assignments:', projectIds);
        return projectIds;
      } catch (error) {
        console.error('Failed to fetch user project assignments:', error);
        return [];
      }
    },
    enabled: !!profile?.id && showMyProjects,
    staleTime: 0, // Always fetch fresh data
    retry: 2,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Fetch milestones for all projects to enable status filtering
  const { data: projectMilestones = {}, isLoading: milestonesLoading, error: milestonesError } = useQuery({
    queryKey: ['all-project-milestones', projects?.map(p => p.id)],
    queryFn: async () => {
      if (!projects?.length) {
        console.log('No projects available for milestone fetching');
        return {};
      }
      
      const projectIds = projects.map(project => project.id);
      console.log('Fetching milestones for projects:', projectIds);
      
      try {
        const { data: milestonesData, error: milestonesError } = await supabase
          .from('milestones')
          .select('id, project_id, status, name, due_date, created_at, updated_at')
          .in('project_id', projectIds);
        
        if (milestonesError) {
          console.error('Error fetching project milestones:', milestonesError);
          throw milestonesError;
        }
        
        // Group milestones by project_id
        const milestonesByProject: Record<string, any[]> = {};
        for (const milestone of milestonesData || []) {
          if (!milestonesByProject[milestone.project_id]) {
            milestonesByProject[milestone.project_id] = [];
          }
          milestonesByProject[milestone.project_id].push(milestone);
        }
        
        console.log('Milestones grouped by project:', Object.keys(milestonesByProject).length, 'projects');
        return milestonesByProject;
      } catch (error) {
        console.error('Error in project milestones query:', error);
        return {};
      }
    },
    enabled: !!projects?.length,
    staleTime: 0, // Always fetch fresh data
    retry: 2,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Log any errors for debugging
  useEffect(() => {
    if (userProjectsError) {
      console.error('User projects query error:', userProjectsError);
    }
    if (milestonesError) {
      console.error('Milestones query error:', milestonesError);
    }
  }, [userProjectsError, milestonesError]);

  // Filter projects based on user assignment, milestone status and search query
  const filteredProjects = React.useMemo(() => {
    console.log('Filtering projects - total:', projects?.length || 0);
    
    if (!projects) {
      console.log('No projects available');
      return [];
    }

    let result = [...projects];
    console.log('Starting with', result.length, 'projects');
    
    // First apply "my projects" filter
    if (showMyProjects && userProjectIds.length > 0) {
      result = result.filter(project => userProjectIds.includes(project.id));
      console.log('After my projects filter:', result.length, 'projects');
    } else if (showMyProjects && !userProjectsLoading && userProjectIds.length === 0) {
      console.log('No assigned projects found, showing empty list');
      return [];
    }
    
    // Then apply status filter
    if (filter !== 'all') {
      const beforeStatusFilter = result.length;
      result = result.filter(project => {
        const milestones = projectMilestones[project.id] || [];
        const projectStatus = getProjectStatus(milestones);
        
        if (filter === 'completed' && projectStatus !== 'completed') return false;
        if (filter === 'in_progress' && projectStatus !== 'in_progress') return false;
        return true;
      });
      console.log('After status filter (' + filter + '):', result.length, 'projects (was', beforeStatusFilter + ')');
    }
    
    // Finally apply search filter if there's a search query
    if (searchQuery.trim()) {
      const beforeSearchFilter = result.length;
      const query = searchQuery.toLowerCase();
      result = result.filter(project => {
        const matches = project.name?.toLowerCase().includes(query) || 
                       project.description?.toLowerCase().includes(query) ||
                       project.company?.name?.toLowerCase().includes(query);
        return matches;
      });
      console.log('After search filter (' + searchQuery + '):', result.length, 'projects (was', beforeSearchFilter + ')');
    }
    
    console.log('Final filtered projects:', result.length);
    return result;
  }, [projects, userProjectIds, userProjectsLoading, projectMilestones, filter, searchQuery, showMyProjects]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  console.log('Pagination - current page:', currentPage, 'total pages:', totalPages, 'showing:', paginatedProjects.length, 'projects');

  // Reset to page 1 when filters change
  useEffect(() => {
    console.log('Filters changed, resetting to page 1');
    setCurrentPage(1);
  }, [filter, searchQuery, showMyProjects]);

  const handlePageChange = (page: number) => {
    console.log('Changing to page:', page);
    setCurrentPage(page);
    // Scroll to top of the list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        // Add ellipsis if currentPage is far from start
        pages.push(-1); // -1 indicates ellipsis
      }
      
      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        // Add ellipsis if currentPage is far from end
        pages.push(-2); // -2 indicates ellipsis (with different key)
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

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

  const getEmptyStateMessage = () => {
    if (showMyProjects && userProjectIds.length === 0 && !userProjectsLoading) {
      return 'You are not assigned to any projects yet.';
    }
    
    if (searchQuery.trim()) {
      return 'No matching projects found. Try a different search term.';
    }
    
    if (filter === 'all') {
      return showMyProjects 
        ? 'No assigned projects found.' 
        : 'No projects created yet. Projects will appear here once created.';
    }
    
    if (filter === 'completed') {
      return showMyProjects 
        ? 'No assigned completed projects found.' 
        : 'No completed projects found.';
    }
    
    return showMyProjects 
      ? 'No assigned projects in progress found.' 
      : 'No projects in progress found.';
  };

  // Check if we're still loading critical data or if there's missing data that should be there
  const isLoading = projectsLoading || (showMyProjects && userProjectsLoading);
  const hasDataIssues = !isLoading && projects && projects.length > 0 && 
    filteredProjects.length === 0 && !searchQuery && filter === 'all' && 
    projects.some(p => !p.company); // Missing company data indicates cache issues

  // Show enhanced loading state for data issues
  if (hasDataIssues) {
    console.error('Data integrity issue detected - missing company data, forcing reload');
    // Force a complete page reload to fix data issues
    setTimeout(() => {
      window.location.reload();
    }, 100);
    return <ProjectListViewSkeleton />;
  }

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage projects with clients and partners</p>
        </div>
      </div>
      
      {/* Summary Cards */}
      <ProjectsSummaryCards 
        projects={projects || []} 
        isLoading={projectsLoading}
        projectMilestones={projectMilestones}
      />
      
      {/* Search and Filters row */}
      <div className="flex justify-between items-center my-6">
        <div className="flex items-center gap-6 flex-1 max-w-2xl min-w-0">
          {/* Search Input */}
          <div className="relative w-full max-w-lg">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search projects..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Show My Projects Toggle */}
          <div className="flex items-center gap-3">
            <Switch
              id="show-my-projects"
              checked={showMyProjects}
              onCheckedChange={setShowMyProjects}
            />
            <label 
              htmlFor="show-my-projects" 
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              Show my projects
            </label>
          </div>
          
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
      {isLoading ? (
        <ProjectListViewSkeleton />
      ) : paginatedProjects && paginatedProjects.length > 0 ? (
        <>
          <ProjectListView 
            projects={paginatedProjects} 
            selectedProjectId={null}
            onDeleteProject={handleDeleteProject}
            projectMilestones={projectMilestones}
          />
          
          {/* Pagination - always visible */}
          <Pagination className="mt-6">
            <PaginationContent>
              {/* Previous page button */}
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {/* Page numbers */}
              {getPageNumbers().map((page, index) => (
                <PaginationItem key={`page-${index}`}>
                  {page < 0 ? (
                    <span className="flex h-9 w-9 items-center justify-center">...</span>
                  ) : (
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              {/* Next page button */}
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) handlePageChange(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      ) : (
        <>
          <Card className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">
                {getEmptyStateMessage()}
              </p>
            </div>
          </Card>
          
          {/* Pagination - always visible even when no projects */}
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => e.preventDefault()}
                  className="pointer-events-none opacity-50"
                />
              </PaginationItem>
              
              <PaginationItem>
                <PaginationLink
                  href="#"
                  isActive={true}
                  onClick={(e) => e.preventDefault()}
                >
                  1
                </PaginationLink>
              </PaginationItem>
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => e.preventDefault()}
                  className="pointer-events-none opacity-50"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
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
