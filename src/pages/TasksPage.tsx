
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import * as z from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Search,
  Calendar, 
  User, 
  Edit, 
  Share, 
  Clock, 
  Filter, 
  X,
  Plus,
  EyeOff,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  MoreVertical
} from 'lucide-react';
import { TaskForm } from '@/components/Tasks/TaskForm';
import { TaskFilters } from '@/components/Tasks/TaskFilters';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';
import { TaskDetailSheet } from '@/components/Tasks/TaskDetailSheet';

// Define the Task type to match our database schema
type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  campaign_id: string | null;
  creator_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  client_visible: boolean | null;
  related_type: string | null;
  assignees?: {
    id: string;
    user_id: string;
  }[];
};

// Define the Contact type for assignees
type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
};

// Define the Campaign type for related campaigns
type Campaign = {
  id: string;
  name: string;
};

export const TasksPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
    assignee: 'all',
    campaign: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // State for task detail sheet
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
  
  // Fetch tasks with filtering
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*, assignees:task_assignees(id, user_id)')
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      // Filter by assignee from the task_assignees table
      if (filters.assignee && filters.assignee !== 'all') {
        query = query.contains('task_assignees.user_id', [filters.assignee]);
      }
      if (filters.campaign && filters.campaign !== 'all') {
        query = query.eq('campaign_id', filters.campaign);
      }
        
      const { data, error } = await query;
        
      if (error) {
        toast({
          title: 'Error fetching tasks',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Task[];
    },
  });

  // Fetch profiles for assignees and creator
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .order('first_name');
      
      if (error) {
        toast({
          title: 'Error fetching profiles',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Contact[];
    },
  });

  // Fetch campaigns for filtering
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name')
        .order('name');
      
      if (error) {
        toast({
          title: 'Error fetching campaigns',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Campaign[];
    },
  });
  
  // Function to handle task click to show detail sheet
  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskSheetOpen(true);
  };
  
  // Function to reset all filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      search: '',
      assignee: 'all',
      campaign: 'all',
    });
  };
  
  // Get assignees for a task
  const getTaskAssignees = (task: Task) => {
    if (!task.assignees) return [];
    
    return task.assignees
      .map(assignee => profiles.find(p => p.id === assignee.user_id))
      .filter((profile): profile is Contact => !!profile);
  };

  // Function to get creator name
  const getCreatorName = (creatorId: string | null) => {
    if (!creatorId) return 'Unassigned';
    
    const creator = profiles.find(p => p.id === creatorId);
    return creator 
      ? `${creator.first_name || ''} ${creator.last_name || ''}`.trim() || 'Unknown User'
      : 'Unknown User';
  };
  
  // Function to get campaign name
  const getCampaignName = (campaignId: string | null) => {
    if (!campaignId) return 'None';
    
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign ? campaign.name : 'Unknown Campaign';
  };
  
  // Helper function for status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Completed</span>;
      case 'in_progress':
        return <span className="badge badge-info">In Progress</span>;
      default:
        return <span className="badge badge-secondary">Todo</span>;
    }
  };
  
  // Helper function for priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="badge badge-danger">High</span>;
      case 'medium':
        return <span className="badge badge-warning">Medium</span>;
      default:
        return <span className="badge badge-success">Low</span>;
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="text-gray">Manage and track your tasks</p>
        </div>
        
        <div className="d-flex align-items-center gap-2">
          <button 
            className={`btn btn-icon ${showFilters ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
          </button>
          
          <button 
            className="btn btn-primary" 
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus size={18} className="mr-2" />
            Add Task
          </button>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="search-filters mb-6">
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        
        {showFilters && (
          <button className="btn btn-text" onClick={resetFilters}>
            <X size={16} className="mr-1" />
            Clear Filters
          </button>
        )}
      </div>
      
      {/* Filter panel */}
      {showFilters && (
        <div className="card mb-6">
          <div className="card-content">
            <TaskFilters 
              filters={filters}
              setFilters={setFilters}
              profiles={profiles}
              campaigns={campaigns}
            />
          </div>
        </div>
      )}
      
      {/* Tasks table */}
      {isLoadingTasks ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <div className="loading-text">Loading tasks...</div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3 className="empty-state-title">No tasks found</h3>
          <p className="empty-state-description">Create your first task to get started</p>
          <button className="btn btn-primary mt-4" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus size={18} className="mr-2" />
            Add Task
          </button>
        </div>
      ) : (
        <div className="table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignees</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Related To</TableHead>
                <TableHead>Client Visible</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map(task => (
                <TableRow
                  key={task.id}
                  className="table-row-clickable"
                  onClick={() => handleTaskClick(task.id)}
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
                    {task.creator_id && (
                      <UserAvatarGroup
                        users={[profiles.find(p => p.id === task.creator_id)].filter((p): p is Contact => !!p)}
                        size="sm"
                      />
                    )}
                    {!task.creator_id && 'Unassigned'}
                  </TableCell>
                  <TableCell>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</TableCell>
                  <TableCell>
                    {task.campaign_id ? (
                      <span className="badge badge-primary">
                        Campaign: {getCampaignName(task.campaign_id)}
                      </span>
                    ) : task.related_type ? (
                      <span className="badge badge-info">
                        {task.related_type}
                      </span>
                    ) : 'None'}
                  </TableCell>
                  <TableCell>
                    {task.client_visible ? (
                      <span className="badge badge-info">Visible</span>
                    ) : (
                      <span className="badge badge-secondary">Hidden</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Create Task Dialog */}
      {isCreateDialogOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">New Task</h3>
              <button className="modal-close" onClick={() => setIsCreateDialogOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <TaskForm
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['tasks'] });
                }}
                profiles={profiles}
                campaigns={campaigns}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Task Detail Sheet */}
      <TaskDetailSheet
        isOpen={isTaskSheetOpen}
        onOpenChange={setIsTaskSheetOpen}
        taskId={selectedTaskId}
      />
    </div>
  );
};

export default TasksPage;
