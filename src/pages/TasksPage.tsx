
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
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, X } from 'lucide-react';
import { TaskForm } from '@/components/Tasks/TaskForm';
import { TaskFilters } from '@/components/Tasks/TaskFilters';
import { CenteredSpinner } from '@/components/ui/CenteredSpinner';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';
import { TaskDetailSheet } from '@/components/Tasks/TaskDetailSheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  
  // Function to get creator job title/role (mocked)
  const getCreatorRole = (creatorId: string | null) => {
    // This would ideally come from the database
    // For now just returning a placeholder
    return 'Team Member';
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
        return <Badge className="bg-green-100 text-green-800 border-green-200 font-medium">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-medium">In Progress</Badge>;
      case 'todo':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 font-medium">Todo</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-medium">Pending</Badge>;
    }
  };
  
  // Function to format budget (mocked) - in a real app this would come from the database
  const formatBudget = (taskId: string) => {
    // Mock values based on task ID to simulate different budgets
    const hash = taskId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `${(hash % 30 + 1)}.${hash % 9}K`;
  };

  return (
    <div className="w-full max-w-full px-4 sm:px-6 py-6 overflow-x-hidden">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage and track your tasks</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-accent text-accent-foreground" : ""}
          >
            <Filter className="h-4 w-4" />
          </Button>
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
      
      {/* Search and filters */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-10"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        
        {showFilters && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>
      
      {/* Filter panel */}
      {showFilters && (
        <div className="mb-6 w-full border rounded-lg p-4 bg-white">
          <TaskFilters 
            filters={filters}
            setFilters={setFilters}
            profiles={profiles}
            campaigns={campaigns}
          />
        </div>
      )}
      
      {/* Tasks table */}
      {isLoadingTasks ? (
        <CenteredSpinner />
      ) : tasks.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-white">
          <h3 className="text-lg font-medium mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-4">Create your first task to get started</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-md border overflow-hidden w-full">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[250px]">User</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map(task => {
                  const creator = profiles.find(p => p.id === task.creator_id);
                  const assignees = getTaskAssignees(task);
                  
                  return (
                    <TableRow 
                      key={task.id}
                      className="cursor-pointer hover:bg-muted/10"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={creator?.avatar_url || undefined} />
                            <AvatarFallback>{creator ? `${creator.first_name?.[0] || ''}${creator.last_name?.[0] || ''}`.toUpperCase() : 'UN'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {creator ? `${creator.first_name || ''} ${creator.last_name || ''}`.trim() || 'Unknown User' : 'Unassigned'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {getCreatorRole(task.creator_id)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="font-medium">
                        {task.title}
                      </TableCell>
                      
                      <TableCell>
                        <UserAvatarGroup users={assignees} max={3} size="sm" />
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(task.status)}
                      </TableCell>
                      
                      <TableCell className="text-right font-medium">
                        {formatBudget(task.id)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
