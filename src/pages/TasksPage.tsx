import { useState, useEffect, useRef } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Calendar, User, Edit, Share, Clock, Filter, X, ViewIcon, List, KanbanSquare } from 'lucide-react';
import { TaskForm } from '@/components/Tasks/TaskForm';
import { Skeleton } from '@/components/ui/skeleton';
import { CenteredSpinner } from '@/components/ui/CenteredSpinner';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';
import { TaskDetailSheet } from '@/components/Tasks/TaskDetailSheet';
import { Switch } from '@/components/ui/switch';
import { TaskListView } from '@/components/Tasks/TaskListView';
import { TaskKanbanView } from '@/components/Tasks/TaskKanbanView';
import { TaskStatusSelect } from '@/components/Tasks/TaskStatusSelect';
import { TaskPrioritySelect } from '@/components/Tasks/TaskPrioritySelect';
import { UserSelect } from '@/components/Deals/UserSelect';
import { useAuth } from '@/contexts/AuthContext';
import { Company } from '@/types/company';

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
  company_id: string | null;
  project_id: string | null;
  assignees?: {
    id: string;
    user_id: string;
  }[];
};

// Define the Contact type for assignees - updated to include role
type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
  role: string;
};

// Campaign type
type Campaign = {
  id: string;
  name: string;
  company_id: string;
};

// Project type
type Project = {
  id: string;
  name: string;
  description: string | null;
};

export const TasksPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  
  // State for task detail sheet
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false);
  
  // State for view toggle (list or kanban) - Changed default to 'kanban'
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');

  // Track if this is the initial load to set default user only once
  const hasSetInitialUser = useRef(false);

  // Current user ID for task filtering
  const currentUserId = user?.id || '';

  // Set current user as default selected user only on initial load
  useEffect(() => {
    if (user?.id && !hasSetInitialUser.current) {
      setSelectedUserId(user.id);
      hasSetInitialUser.current = true;
    }
  }, [user?.id]);
  
  // Helper function to check if a completed task is older than 3 days
  const isOldCompletedTask = (task: Task) => {
    if (task.status !== 'completed') return false;
    
    const updatedAt = new Date(task.updated_at);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    return updatedAt < threeDaysAgo;
  };
  
  // Fetch tasks with filtering
  const { data: allTasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', searchTerm, selectedStatus, selectedPriority],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*, assignees:task_assignees(id, user_id)')
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (selectedStatus && selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }
      if (selectedPriority && selectedPriority !== 'all') {
        query = query.eq('priority', selectedPriority);
      }
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
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

  // Filter tasks based on user selection and hide old completed tasks
  const tasks = allTasks
    .filter(task => !isOldCompletedTask(task)) // Hide old completed tasks
    .filter(task => {
      // Apply user filter if selected
      if (selectedUserId) {
        return task.assignees?.some(assignee => assignee.user_id === selectedUserId);
      }
      return true;
    });

  // Fetch profiles for assignees and creator - updated to only include admin and employee users
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, role')
        .in('role', ['admin', 'employee'])
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
        .select('id, name, company_id')
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

  // Fetch projects for related items
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description')
        .order('name');
      
      if (error) {
        toast({
          title: 'Error fetching projects',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Project[];
    },
  });

  // Fetch companies for tasks - Updated to include website and logo_url
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, website, logo_url')
        .order('name');
      
      if (error) {
        toast({
          title: 'Error fetching companies',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Company[];
    },
  });

  // Mutation for updating task status (for Kanban drag and drop)
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      console.log(`Updating task ${taskId} to status: ${status}`);
      
      const { data, error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .select();
        
      if (error) {
        console.error('Error updating task status:', error);
        throw error;
      }
      
      console.log('Task updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Task updated',
        description: 'Task status has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Function to handle task click to show detail sheet
  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsTaskSheetOpen(true);
  };

  // Function to handle task status change (for Kanban view)
  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    console.log(`TasksPage: Moving task ${taskId} to status: ${newStatus}`);
    updateTaskMutation.mutate({ taskId, status: newStatus });
  };
  
  // Get assignees for a task
  const getTaskAssignees = (task: Task) => {
    if (!task.assignees) return [];
    
    return task.assignees
      .map(assignee => profiles.find(p => p.id === assignee.user_id))
      .filter((profile): profile is Contact => !!profile);
  };

  // Function to get creator info
  const getCreatorInfo = (creatorId: string | null) => {
    if (!creatorId) return null;
    
    return profiles.find(p => p.id === creatorId) || null;
  };

  // Function to get company name
  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return null;
    
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : null;
  };
  
  // Function to get campaign name
  const getCampaignName = (campaignId: string | null) => {
    if (!campaignId) return null;
    
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign ? campaign.name : null;
  };

  // Function to get project name
  const getProjectName = (projectId: string | null) => {
    if (!projectId) return null;
    
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : null;
  };
  
  // Helper function for status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Todo</Badge>;
    }
  };
  
  // Helper function for priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
      default:
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
    }
  };

  // Group tasks by status for Kanban view
  const tasksByStatus = {
    todo: tasks.filter(task => task.status === 'todo'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    completed: tasks.filter(task => task.status === 'completed'),
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage and track your tasks</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View toggle switch - Icons only */}
          <div className="flex items-center mr-2 bg-muted rounded-md p-1">
            <div 
              className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer ${viewMode === 'kanban' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setViewMode('kanban')}
            >
              <KanbanSquare className="h-4 w-4" />
            </div>
            <div 
              className={`flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer ${viewMode === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </div>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>New Task</DialogTitle>
              </DialogHeader>
              <TaskForm 
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['tasks'] });
                }}
                profiles={profiles}
                campaigns={campaigns}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* New filter bar layout: [Search bar][User selector][Status selector][Priority selector] */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <UserSelect
          profiles={profiles}
          selectedUserId={selectedUserId}
          onUserChange={setSelectedUserId}
          currentUserId={user?.id}
          allUsersLabel="All tasks"
        />
        
        <TaskStatusSelect
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
        
        <TaskPrioritySelect
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
        />
      </div>
      
      {/* Tasks content based on view mode */}
      {viewMode === 'list' ? (
        <TaskListView 
          tasks={tasks}
          getStatusBadge={getStatusBadge}
          getPriorityBadge={getPriorityBadge}
          getTaskAssignees={getTaskAssignees}
          getCampaignName={getCampaignName}
          getProjectName={getProjectName}
          profiles={profiles}
          companies={companies}
          onTaskClick={handleTaskClick}
          isLoading={isLoadingTasks}
        />
      ) : (
        <TaskKanbanView 
          tasksByStatus={tasksByStatus}
          getStatusBadge={getStatusBadge}
          getPriorityBadge={getPriorityBadge}
          getTaskAssignees={getTaskAssignees}
          profiles={profiles}
          onTaskClick={handleTaskClick}
          onTaskMove={handleTaskStatusChange}
          getCreatorInfo={getCreatorInfo}
          getCompanyName={getCompanyName}
          getCampaignName={getCampaignName}
          getProjectName={getProjectName}
          isLoading={isLoadingTasks}
        />
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
