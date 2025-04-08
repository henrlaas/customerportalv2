
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  User, 
  Edit, 
  Trash2, 
  Share,
  Clock3,
  FileText,
  Link as LinkIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import { TaskForm } from '@/components/Tasks/TaskForm';
import { TaskAttachments } from '@/components/Tasks/TaskAttachments';
import { TaskTimer } from '@/components/Tasks/TaskTimer';

// Define the Task type
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

// Define the Contact type
type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

// Define the Campaign type
type Campaign = {
  id: string;
  name: string;
};

export const TaskDetailPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  
  // Fetch task details
  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      if (!taskId) return null;
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();
        
      if (error) {
        toast({
          title: 'Error fetching task',
          description: error.message,
          variant: 'destructive',
        });
        navigate('/tasks');
        return null;
      }
      
      return data as Task;
    },
    enabled: !!taskId,
  });
  
  // Fetch profiles
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');
      
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
  
  // Fetch campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name');
      
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
  
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      if (!taskId) throw new Error('Task ID is missing');
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Task deleted',
        description: 'The task has been deleted successfully',
      });
      navigate('/tasks');
    },
    onError: (error) => {
      toast({
        title: 'Error deleting task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Toggle client visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: async () => {
      if (!taskId || !task) throw new Error('Task ID or data is missing');
      
      const { error } = await supabase
        .from('tasks')
        .update({ client_visible: !task.client_visible })
        .eq('id', taskId);
        
      if (error) throw error;
      
      return {
        ...task,
        client_visible: !task.client_visible
      };
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(['task', taskId], updatedTask);
      toast({
        title: 'Visibility updated',
        description: `Task is now ${updatedTask.client_visible ? 'visible' : 'hidden'} to clients`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating visibility',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Share task (placeholder for future implementation)
  const shareTask = () => {
    // Copy task URL to clipboard
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link copied',
      description: 'Task link copied to clipboard',
    });
    setIsShareDialogOpen(false);
  };
  
  // Helper function to get assignee name
  const getAssigneeName = (assigneeId: string | null) => {
    if (!assigneeId) return 'Unassigned';
    
    const assignee = profiles.find(p => p.id === assigneeId);
    return assignee 
      ? `${assignee.first_name || ''} ${assignee.last_name || ''}`.trim() || 'Unknown User'
      : 'Unknown User';
  };
  
  // Helper function to get campaign name
  const getCampaignName = (campaignId: string | null) => {
    if (!campaignId) return null;
    
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign ? campaign.name : 'Unknown Campaign';
  };
  
  // Helper function for priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };
  
  // Helper function for status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const handleDelete = () => {
    deleteTaskMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!task) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Task not found</h2>
          <p className="text-muted-foreground mt-2">The task you're looking for doesn't exist or has been deleted.</p>
          <Button className="mt-4" onClick={() => navigate('/tasks')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header with navigation */}
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/tasks')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Button>
      </div>
      
      {/* Main task details card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{task.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className={getStatusColor(task.status)}>
                    {task.status === 'in_progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </Badge>
                  {task.client_visible && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      Client Visible
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => toggleVisibilityMutation.mutate()}>
                  {task.client_visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" size="icon" onClick={() => setIsShareDialogOpen(true)}>
                  <Share className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.description && (
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{task.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                  <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                </div>
                
                <div className="flex items-center">
                  <User className="h-4 w-4 text-muted-foreground mr-2" />
                  <span>Assigned to: {getAssigneeName(task.assigned_to)}</span>
                </div>
                
                {task.campaign_id && (
                  <div className="flex items-center">
                    <LinkIcon className="h-4 w-4 text-muted-foreground mr-2" />
                    <span>Related to campaign: {getCampaignName(task.campaign_id)}</span>
                  </div>
                )}
                
                {task.related_type && task.related_type !== 'campaign' && (
                  <div className="flex items-center">
                    <LinkIcon className="h-4 w-4 text-muted-foreground mr-2" />
                    <span>Related to: {task.related_type}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                  <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Task Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskAttachments taskId={task.id} />
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar with timer and other tools */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskTimer taskId={task.id} />
            </CardContent>
          </Card>
          
          {/* Placeholder for future features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity</CardTitle>
              <CardDescription>Recent updates and comments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">No recent activity</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Edit task dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm 
            taskId={task.id}
            initialData={task}
            profiles={profiles}
            campaigns={campaigns}
            onSuccess={() => {
              setIsEditDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ['task', taskId] });
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this task? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteTaskMutation.isPending}>
              {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Share dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Share Task</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Share this task with your team or clients by copying the link:</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={shareTask}>
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetailPage;
