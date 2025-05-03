
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  User,
  Edit,
  Trash2,
  Share,
  Clock3,
  FileText,
  Link as LinkIcon,
  Eye,
  EyeOff,
  X,
  CheckCircle
} from "lucide-react";
import { TaskForm } from "@/components/Tasks/TaskForm";
import { TaskAttachments } from "@/components/Tasks/TaskAttachments";
import { TaskTimer } from "@/components/Tasks/TaskTimer";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type TaskDetailSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | null;
};

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
  creator_id: string | null;
  created_at: string;
  updated_at: string;
  client_visible: boolean | null;
  related_type: string | null;
};

type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

type Campaign = {
  id: string;
  name: string;
};

export const TaskDetailSheet = ({ isOpen, onOpenChange, taskId }: TaskDetailSheetProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  // Fetch task details
  const { data: task, isLoading: isLoadingTask } = useQuery({
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
        return null;
      }
      
      return data as Task;
    },
    enabled: !!taskId && isOpen,
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
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
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
    onError: (error: any) => {
      toast({
        title: 'Error updating visibility',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update task status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: 'todo' | 'in_progress' | 'completed') => {
      if (!taskId) throw new Error('Task ID is missing');
      
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)
        .select()
        .single();
        
      if (error) throw error;
      
      return data as Task;
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(['task', taskId], updatedTask);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Status updated',
        description: `Task is now marked as ${updatedTask.status === 'completed' ? 'completed' : updatedTask.status === 'in_progress' ? 'in progress' : 'to do'}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Share task (placeholder for future implementation)
  const shareTask = () => {
    // Copy task URL to clipboard
    navigator.clipboard.writeText(window.location.origin + `/tasks/${taskId}`);
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
  
  // Helper function to get creator name
  const getCreatorName = (creatorId: string | null) => {
    if (!creatorId) return 'Unassigned';
    
    const creator = profiles.find(p => p.id === creatorId);
    return creator 
      ? `${creator.first_name || ''} ${creator.last_name || ''}`.trim() || 'Unknown User'
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

  if (isLoadingTask && taskId) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-xl rounded-l-2xl border-l-0">
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse-soft text-center">
              <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-teal animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-medium text-teal">Loading task details...</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!task && taskId) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-xl rounded-l-2xl border-l-0">
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-xl font-heading font-bold">Task not found</h2>
            <p className="text-muted-foreground mt-2">The task you're looking for doesn't exist or has been deleted.</p>
            <Button className="mt-4" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-xl overflow-y-auto pb-20 rounded-l-2xl border-l-0" side="right">
          {task && (
            <>
              <SheetHeader className="space-y-2 pb-4 pt-2">
                <div className="flex justify-between items-start">
                  <SheetTitle className="text-2xl mr-8 font-heading">{task.title}</SheetTitle>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <X className="h-4 w-4" />
                    </Button>
                  </SheetClose>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={`${getStatusColor(task.status)} rounded-full`}>
                    {task.status === 'in_progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className={`${getPriorityColor(task.priority)} rounded-full`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                  </Badge>
                  {task.client_visible && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 rounded-full">
                      Client Visible
                    </Badge>
                  )}
                </div>
              </SheetHeader>
              
              <div className="space-y-6">
                {/* Status toggle buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={task.status === 'todo' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => updateStatusMutation.mutate('todo')}
                    disabled={updateStatusMutation.isPending}
                    className="rounded-full"
                  >
                    Todo
                  </Button>
                  <Button
                    variant={task.status === 'in_progress' ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateStatusMutation.mutate('in_progress')}
                    disabled={updateStatusMutation.isPending}
                    className="rounded-full"
                  >
                    In Progress
                  </Button>
                  <Button
                    variant={task.status === 'completed' ? "mint" : "outline"}
                    size="sm"
                    onClick={() => updateStatusMutation.mutate('completed')}
                    disabled={updateStatusMutation.isPending}
                    className="rounded-full"
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Complete
                  </Button>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)} className="rounded-full">
                    <Edit className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toggleVisibilityMutation.mutate()} className="rounded-full">
                    {task.client_visible ? (
                      <>
                        <Eye className="mr-1 h-4 w-4" />
                        Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="mr-1 h-4 w-4" />
                        Hidden
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsShareDialogOpen(true)} className="rounded-full">
                    <Share className="mr-1 h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 rounded-full" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </Button>
                </div>
                
                {/* Description - always visible above tabs */}
                {task.description && (
                  <div className="space-y-2 bg-offwhite p-4 rounded-xl">
                    <h3 className="text-sm font-medium text-teal-800">Description</h3>
                    <div className="prose max-w-none text-sm">
                      <p className="whitespace-pre-wrap">{task.description}</p>
                    </div>
                  </div>
                )}

                {/* Tab selector */}
                <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-3 w-full rounded-xl bg-offwhite p-1">
                    <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-white">Details</TabsTrigger>
                    <TabsTrigger value="timeTracking" className="rounded-lg data-[state=active]:bg-white">Time Tracking</TabsTrigger>
                    <TabsTrigger value="attachments" className="rounded-lg data-[state=active]:bg-white">Attachments</TabsTrigger>
                  </TabsList>
                  
                  {/* Details Tab */}
                  <TabsContent value="details" className="space-y-4 pt-4">
                    <div className="space-y-3 bg-white p-4 rounded-xl shadow-soft">
                      <h3 className="text-base font-medium text-teal-800 font-heading">Details</h3>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex items-center bg-offwhite p-3 rounded-lg">
                          <Calendar className="h-5 w-5 text-teal mr-3" />
                          <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                        </div>
                        
                        <div className="flex items-center bg-offwhite p-3 rounded-lg">
                          <User className="h-5 w-5 text-teal mr-3" />
                          <span>Assigned to: <strong>{getAssigneeName(task.assigned_to)}</strong></span>
                        </div>
                        
                        <div className="flex items-center bg-offwhite p-3 rounded-lg">
                          <User className="h-5 w-5 text-teal mr-3" />
                          <span>Created by: <strong>{getCreatorName(task.creator_id)}</strong></span>
                        </div>
                        
                        {task.campaign_id && (
                          <div className="flex items-center bg-offwhite p-3 rounded-lg">
                            <LinkIcon className="h-5 w-5 text-teal mr-3" />
                            <span>Related to campaign: <strong>{getCampaignName(task.campaign_id)}</strong></span>
                          </div>
                        )}
                        
                        {task.related_type && task.related_type !== 'campaign' && (
                          <div className="flex items-center bg-offwhite p-3 rounded-lg">
                            <LinkIcon className="h-5 w-5 text-teal mr-3" />
                            <span>Related to: <strong>{task.related_type}</strong></span>
                          </div>
                        )}
                        
                        <div className="flex items-center bg-offwhite p-3 rounded-lg">
                          <Clock3 className="h-5 w-5 text-teal mr-3" />
                          <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Time Tracking Tab */}
                  <TabsContent value="timeTracking" className="space-y-4 pt-4">
                    <div className="space-y-3 bg-white p-4 rounded-xl shadow-soft">
                      <h3 className="text-base font-medium text-teal-800 font-heading">Time Tracking</h3>
                      <TaskTimer taskId={task.id} />
                    </div>
                  </TabsContent>
                  
                  {/* Attachments Tab */}
                  <TabsContent value="attachments" className="space-y-4 pt-4">
                    <div className="space-y-3 bg-white p-4 rounded-xl shadow-soft">
                      <h3 className="text-base font-medium text-teal-800 font-heading">Attachments</h3>
                      <TaskAttachments taskId={task.id} />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      
      {/* Edit task dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">Edit Task</DialogTitle>
          </DialogHeader>
          {task && (
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
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading text-red-600">Delete Task</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this task? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-full">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteTaskMutation.isPending} className="rounded-full">
              {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Share dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">Share Task</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Share this task with your team or clients by copying the link:</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={shareTask} className="rounded-full">
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskDetailSheet;
