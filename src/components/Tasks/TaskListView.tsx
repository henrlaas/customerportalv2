import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Eye, EyeOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  creator_id: string | null;
  campaign_id: string | null;
  project_id: string | null;
  due_date: string | null;
  related_type: string | null;
  client_visible: boolean | null;
  assignees?: { id: string; user_id: string }[];
  creator?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | { error: boolean } | null;
}

interface Contact {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
}

interface TaskListViewProps {
  tasks: Task[];
  getStatusBadge: (status: string) => React.ReactNode;
  getPriorityBadge: (priority: string) => React.ReactNode;
  getTaskAssignees: (task: Task) => Contact[];
  getCampaignName: (campaignId: string | null) => string;
  getProjectName: (projectId: string | null) => string;
  profiles: Contact[];
  onTaskClick: (taskId: string) => void;
  isLoading?: boolean;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  getStatusBadge,
  getPriorityBadge,
  getTaskAssignees,
  getCampaignName,
  getProjectName,
  profiles,
  onTaskClick,
  isLoading = false,
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const totalPages = Math.ceil(tasks.length / itemsPerPage);

  // Get current page tasks
  const getCurrentPageTasks = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return tasks.slice(startIndex, endIndex);
  };

  const paginatedTasks = getCurrentPageTasks();

  // Helper function to check if creator is valid
  const isValidCreator = (creator: any): creator is { id: string; first_name: string | null; last_name: string | null; avatar_url: string | null } => {
    return creator && typeof creator === 'object' && 'id' in creator && !('error' in creator);
  };

  // Helper function to get creator initials
  const getCreatorInitials = (creator: any) => {
    if (!creator || !isValidCreator(creator)) return '?';
    
    const first = creator.first_name?.[0] || '';
    const last = creator.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  // Helper function to get creator display name
  const getCreatorDisplayName = (creator: any) => {
    if (!creator || !isValidCreator(creator)) return 'Unknown';
    
    return creator.first_name || 'Unknown User';
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
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  console.log('TaskListView received tasks:', tasks);

  // Loading skeleton UI
  const LoadingSkeleton = () => (
    <>
      {Array(5).fill(0).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell><Skeleton className="h-5 w-full" /></TableCell>
          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
          <TableCell>
            <div className="flex -space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8 rounded-full" />
          </TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-6 w-32" /></TableCell>
          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-md border shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignees</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Campaign/Project</TableHead>
                <TableHead>Client Visible</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <LoadingSkeleton />
              ) : tasks.length > 0 ? (
                paginatedTasks.map(task => (
                  <TableRow 
                    key={task.id}
                    className="cursor-pointer hover:bg-muted/60"
                    onClick={() => onTaskClick(task.id)}
                  >
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>
                      <UserAvatarGroup 
                        users={getTaskAssignees(task)}
                        size="sm"
                      />
                    </TableCell>
                    <TableCell>
                      {isValidCreator(task.creator) ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage 
                              src={task.creator.avatar_url || undefined} 
                              alt={getCreatorDisplayName(task.creator)} 
                            />
                            <AvatarFallback className="text-xs bg-muted">
                              {getCreatorInitials(task.creator)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {getCreatorDisplayName(task.creator)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</TableCell>
                    <TableCell>
                      {task.project_id ? (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                          Project: {getProjectName(task.project_id)}
                        </Badge>
                      ) : task.campaign_id ? (
                        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                          Campaign: {getCampaignName(task.campaign_id)}
                        </Badge>
                      ) : task.related_type ? (
                        <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                          {task.related_type}
                        </Badge>
                      ) : 'None'}
                    </TableCell>
                    <TableCell>
                      {task.client_visible ? (
                        <Eye className="h-4 w-4 text-blue-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" style={{ strokeDasharray: '2,2' }} />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No tasks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination - only show if we have more than itemsPerPage tasks and not loading */}
      {!isLoading && tasks.length > itemsPerPage && (
        <Pagination className="mt-4">
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
      )}
    </div>
  );
};
