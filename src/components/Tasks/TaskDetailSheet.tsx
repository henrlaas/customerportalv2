
// Update the imports section by adding the X icon
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarIcon,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  Users,
  Tag,
  MoreHorizontal,
  MessageSquare,
  Paperclip,
  PlayCircle,
  PauseCircle,
  CheckSquare,
  Square,
  Plus,
  X,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TaskForm } from './TaskForm';
import { TaskTimer } from './TaskTimer';
import { TaskAttachments } from './TaskAttachments';
import { TaskComments } from './TaskComments';
import { SubtasksList } from './SubtasksList';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  campaign_id: string | null;
  creator_id: string | null;
  client_visible: boolean | null;
  related_type: string | null;
  project_id: string | null;
  department: string | null;
  estimated_time: number | null;
};

type TaskDetailSheetProps = {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const TaskDetailSheet = ({ taskId, open, onOpenChange }: TaskDetailSheetProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [timeTracking, setTimeTracking] = useState<{isRunning: boolean, entryId: string | null}>({
    isRunning: false,
    entryId: null
  });

  // Fetch task details
  const { 
    data: task, 
    isLoading: isLoadingTask,
    refetch: refetchTask
  } = useQuery({
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
    enabled: !!taskId && open
  });

  // Fetch task assignees
  const { data: assignees = [] } = useQuery({
    queryKey: ['taskAssignees', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      
      const { data, error } = await supabase
        .from('task_assignees')
        .select('user_id, profiles:user_id(id, first_name, last_name, avatar_url)')
        .eq('task_id', taskId);
      
      if (error) {
        toast({
          title: 'Error fetching assignees',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data.map(item => item.profiles);
    },
    enabled: !!taskId && open
  });

  // Fetch creator details
  const { data: creator } = useQuery({
    queryKey: ['taskCreator', task?.creator_id],
    queryFn: async () => {
      if (!task?.creator_id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('id', task.creator_id)
        .single();
      
      if (error) {
        console.error('Error fetching creator:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!task?.creator_id && open
  });

  // Fetch campaign details if related
  const { data: campaign } = useQuery({
    queryKey: ['taskCampaign', task?.campaign_id],
    queryFn: async () => {
      if (!task?.campaign_id) return null;
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name')
        .eq('id', task.campaign_id)
        .single();
      
      if (error) {
        console.error('Error fetching campaign:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!task?.campaign_id && open
  });

  // Check for active time entries
  useEffect(() => {
    const checkActiveTimeEntries = async () => {
      if (!taskId) return;
      
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('task_id', taskId)
        .eq('is_running', true)
        .limit(1);
      
      if (error) {
        console.error('Error checking active time entries:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setTimeTracking({
          isRunning: true,
          entryId: data[0].id
        });
      } else {
        setTimeTracking({
          isRunning: false,
          entryId: null
        });
      }
    };
    
    if (open && taskId) {
      checkActiveTimeEntries();
    }
  }, [taskId, open]);

  // Toggle time tracking
  const toggleTimeTracking = async () => {
    if (!taskId) return;
    
    try {
      if (timeTracking.isRunning && timeTracking.entryId) {
        // Stop tracking
        const { error } = await supabase
          .from('time_entries')
          .update({
            end_time: new Date().toISOString(),
            is_running: false
          })
          .eq('id', timeTracking.entryId);
        
        if (error) throw error;
        
        setTimeTracking({ isRunning: false, entryId: null });
        toast({ title: 'Time tracking stopped' });
      } else {
        // Start tracking
        const { data: userSession } = await supabase.auth.getSession();
        const userId = userSession.session?.user?.id;
        
        if (!userId) {
          toast({ 
            title: 'Authentication required', 
            description: 'You must be logged in to track time',
            variant: 'destructive' 
          });
          return;
        }
        
        const { data, error } = await supabase
          .from('time_entries')
          .insert({
            task_id: taskId,
            user_id: userId,
            start_time: new Date().toISOString(),
            is_running: true
          })
          .select()
          .single();
        
        if (error) throw error;
        
        setTimeTracking({ isRunning: true, entryId: data.id });
        toast({ title: 'Time tracking started' });
      }
      
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
    } catch (error: any) {
      toast({ 
        title: 'Error tracking time', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  // Handle task status update
  const updateTaskStatus = useMutation({
    mutationFn: async (newStatus: 'todo' | 'in_progress' | 'completed') => {
      if (!taskId) return;
      
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
      
      if (error) throw error;
      
      return newStatus;
    },
    onSuccess: (newStatus) => {
      toast({
        title: 'Task updated',
        description: `Task status changed to ${newStatus}`
      });
      
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete task mutation
  const deleteTask = useMutation({
    mutationFn: async () => {
      if (!taskId) return;
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Task deleted',
        description: 'The task has been deleted successfully'
      });
      
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting task',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Get initials for avatar
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  // Get priority badge color
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

  // Get status badge color
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

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return format(new Date(dateString), 'PP');
  };

  // Handle sheet close
  const handleSheetClose = () => {
    setIsEditing(false);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={handleSheetClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-scroll" side="right">
        <SheetHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              {!isEditing && task ? (
                <SheetTitle className="text-xl font-bold break-words">{task.title}</SheetTitle>
              ) : (
                <div className="h-7 w-3/4 bg-muted animate-pulse rounded"></div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!isEditing && task && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isEditing && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => deleteTask.mutate()}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <SheetClose className="rounded-full">
                <X className="h-5 w-5" />
              </SheetClose>
            </div>
          </div>
          
          {!isEditing && task && (
            <div className="flex flex-wrap gap-2 mt-2">
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
              
              {task.due_date && (
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {formatDate(task.due_date)}
                </Badge>
              )}
              
              {task.campaign_id && campaign && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  {campaign.name}
                </Badge>
              )}
              
              {task.client_visible && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  Client visible
                </Badge>
              )}
            </div>
          )}
        </SheetHeader>

        {isEditing && task ? (
          <div className="py-4">
            <TaskForm
              onSuccess={() => {
                setIsEditing(false);
                refetchTask();
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
              }}
              taskId={task.id}
              initialData={task}
              profiles={[]}  // We'll populate this from the parent
              campaigns={[]} // We'll populate this from the parent
            />
          </div>
        ) : (
          <>
            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 my-4">
              <Button 
                variant={task?.status === 'todo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateTaskStatus.mutate('todo')}
                disabled={!task}
              >
                <Square className="h-4 w-4 mr-1" />
                Todo
              </Button>
              <Button 
                variant={task?.status === 'in_progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateTaskStatus.mutate('in_progress')}
                disabled={!task}
              >
                <Clock className="h-4 w-4 mr-1" />
                In Progress
              </Button>
              <Button 
                variant={task?.status === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateTaskStatus.mutate('completed')}
                disabled={!task}
              >
                <CheckSquare className="h-4 w-4 mr-1" />
                Completed
              </Button>
              
              <Button
                variant={timeTracking.isRunning ? "destructive" : "default"}
                size="sm"
                onClick={toggleTimeTracking}
                disabled={!task}
                className="ml-auto"
              >
                {timeTracking.isRunning ? (
                  <>
                    <PauseCircle className="h-4 w-4 mr-1" />
                    Stop time
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-1" />
                    Start time
                  </>
                )}
              </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="time">Time</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                {isLoadingTask ? (
                  <div className="space-y-4">
                    <div className="h-24 bg-muted animate-pulse rounded"></div>
                    <div className="h-6 w-1/3 bg-muted animate-pulse rounded"></div>
                    <div className="h-12 bg-muted animate-pulse rounded"></div>
                  </div>
                ) : task ? (
                  <>
                    {/* Description */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                      <div className="rounded-md bg-muted/30 p-3 min-h-[100px]">
                        {task.description || <span className="text-muted-foreground italic">No description</span>}
                      </div>
                    </div>
                    
                    {/* Assignees */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Assignees</h3>
                      <div className="flex flex-wrap gap-2">
                        {assignees.length > 0 ? assignees.map((assignee: any) => (
                          <div key={assignee.id} className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={assignee.avatar_url || undefined} />
                              <AvatarFallback>{getInitials(assignee.first_name, assignee.last_name)}</AvatarFallback>
                            </Avatar>
                            <span>
                              {assignee.first_name || ''} {assignee.last_name || ''}
                            </span>
                          </div>
                        )) : <span className="text-muted-foreground italic">No assignees</span>}
                      </div>
                    </div>
                    
                    {/* Creator */}
                    {creator && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Creator</h3>
                        <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full inline-flex">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={creator.avatar_url || undefined} />
                            <AvatarFallback>{getInitials(creator.first_name, creator.last_name)}</AvatarFallback>
                          </Avatar>
                          <span>
                            {creator.first_name || ''} {creator.last_name || ''}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Additional fields */}
                    {task.estimated_time && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Estimated time</h3>
                        <p>{task.estimated_time} minutes</p>
                      </div>
                    )}
                    
                    {task.department && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Department</h3>
                        <p>{task.department}</p>
                      </div>
                    )}
                    
                    <TaskAttachments taskId={task.id} />
                  </>
                ) : (
                  <p className="text-muted-foreground">Task not found</p>
                )}
              </TabsContent>
              
              <TabsContent value="subtasks">
                {task && <SubtasksList taskId={task.id} />}
              </TabsContent>
              
              <TabsContent value="comments">
                {task && <TaskComments taskId={task.id} />}
              </TabsContent>
              
              <TabsContent value="time">
                {task && <TaskTimer taskId={task.id} />}
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
