
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, insertWithUser } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Calendar, User, Edit, Share, Clock, Filter, X, UserRound } from 'lucide-react';
import { TaskForm } from '@/components/Tasks/TaskForm';
import { TaskFilters } from '@/components/Tasks/TaskFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { CenteredSpinner } from '@/components/ui/CenteredSpinner';

// Define the Task type to match our database schema
type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  campaign_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  client_visible: boolean | null;
  related_type: string | null;
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
    assignee: 'all',
    creator: 'all',
    campaign: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch tasks with filtering
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*')
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
        query = query.eq('assigned_to', filters.assignee);
      }
      if (filters.creator && filters.creator !== 'all') {
        query = query.eq('created_by', filters.creator);
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

  // Fetch profiles for assignees
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
  
  // Function to handle task click to navigate to details page
  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };
  
  // Function to reset all filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      search: '',
      assignee: 'all',
      creator: 'all',
      campaign: 'all',
    });
  };
  
  // Helper function to get initials from name
  const getInitials = (firstName: string | null, lastName: string | null) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };
  
  // Function to get assignee or creator info
  const getUserInfo = (userId: string | null, renderAvatar: boolean = true) => {
    if (!userId) return renderAvatar ? (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
            <UserRound size={14} />
          </AvatarFallback>
        </Avatar>
        <span>Unassigned</span>
      </div>
    ) : 'Unassigned';
    
    const user = profiles.find(p => p.id === userId);
    
    if (!user) return renderAvatar ? (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
            <UserRound size={14} />
          </AvatarFallback>
        </Avatar>
        <span>Unknown User</span>
      </div>
    ) : 'Unknown User';
    
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User';
    
    if (renderAvatar) {
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            {user.avatar_url ? (
              <AvatarImage src={user.avatar_url} alt={fullName} />
            ) : (
              <AvatarFallback className="bg-purple-100 text-purple-800 text-xs">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            )}
          </Avatar>
          <span>{fullName}</span>
        </div>
      );
    }
    
    return fullName;
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
        <Card className="mb-6 w-full">
          <CardContent className="pt-6">
            <TaskFilters 
              filters={filters}
              setFilters={setFilters}
              profiles={profiles}
              campaigns={campaigns}
            />
          </CardContent>
        </Card>
      )}
      
      {/* Tasks table */}
      {isLoadingTasks ? (
        <CenteredSpinner />
      ) : tasks.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-medium mb-2">No tasks found</h3>
          <p className="text-muted-foreground mb-4">Create your first task to get started</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-md border shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignee</TableHead>
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
                    className="cursor-pointer hover:bg-muted/60"
                    onClick={() => handleTaskClick(task.id)}
                  >
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>{getUserInfo(task.assigned_to)}</TableCell>
                    <TableCell>{getUserInfo(task.created_by)}</TableCell>
                    <TableCell>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</TableCell>
                    <TableCell>
                      {task.campaign_id ? (
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
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Visible</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">Hidden</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
