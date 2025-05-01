
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDistance } from 'date-fns';
import { formatDuration } from '@/utils/timeUtils';
import { Task } from '@/types/timeTracking';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Clock,
  File,
  MessageSquare,
  Play,
  Pause,
  Save,
  Check,
  X,
  User,
  Plus,
  Trash2,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import TaskTimer from './TaskTimer';
import { TaskAttachments } from './TaskAttachments';

// Define the Contact type for assignees
type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
};

interface TaskSidePanelProps {
  taskId: string | null;
  open: boolean;
  onClose: () => void;
  profiles: Contact[];
}

export const TaskSidePanel: React.FC<TaskSidePanelProps> = ({ 
  taskId, 
  open, 
  onClose,
  profiles 
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  
  // Form state for editing the task
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    due_date: '',
    assigned_to: '',
    client_visible: false,
  });

  // Task query
  const { data: task, isLoading: isTaskLoading } = useQuery({
    queryKey: ['task-details', taskId],
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
      
      return data;
    },
    enabled: !!taskId && open,
  });

  // Fetch task assignees
  const { data: assignees = [] } = useQuery({
    queryKey: ['task-assignees', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      
      const { data, error } = await supabase
        .from('task_assignees')
        .select('user_id, notes')
        .eq('task_id', taskId);
        
      if (error) {
        console.error('Error fetching task assignees:', error);
        return [];
      }
      
      // Get user profiles for assignees
      if (data.length > 0) {
        const userIds = data.map(a => a.user_id);
        const { data: userProfiles, error: userError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url')
          .in('id', userIds);
          
        if (userError) {
          console.error('Error fetching user profiles:', userError);
          return [];
        }
        
        // Combine user profile with notes
        return userProfiles.map(profile => {
          const assigneeData = data.find(a => a.user_id === profile.id);
          return {
            ...profile,
            notes: assigneeData?.notes || null
          };
        });
      }
      
      return [];
    },
    enabled: !!taskId && open,
  });

  // Update form data when task data is loaded
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        assigned_to: task.assigned_to || '',
        client_visible: !!task.client_visible,
      });
    }
  }, [task]);

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!taskId) throw new Error('Task ID is missing');
      
      const { error } = await supabase
        .from('tasks')
        .update(data)
        .eq('id', taskId);
        
      if (error) throw error;
      
      return true;
    },
    onSuccess: () => {
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ['task-details', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Refresh tasks list
      toast({
        title: 'Task updated',
        description: 'The task has been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedTask = {
      ...formData,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
    };
    
    updateTaskMutation.mutate(updatedTask);
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Helper function to get initials from name
  const getInitials = (firstName: string | null, lastName: string | null) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
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

  // If sheet is closed or no taskId, don't render the content
  if (!open || !taskId) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {!editMode ? (
                <SheetTitle className="text-xl font-bold truncate">{task?.title}</SheetTitle>
              ) : (
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="text-xl font-bold mb-2"
                />
              )}
              <div className="flex flex-wrap gap-2 mt-1">
                {!editMode ? (
                  <>
                    {task?.status && getStatusBadge(task.status)}
                    {task?.priority && getPriorityBadge(task.priority)}
                    {task?.client_visible && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Client Visible</Badge>
                    )}
                  </>
                ) : null}
              </div>
            </div>
            <div className="flex space-x-2">
              {!editMode ? (
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                  Edit
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSubmit}>
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetHeader>

        <Tabs 
          defaultValue="details" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mt-6"
        >
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="time" className="flex-1">Time Tracking</TabsTrigger>
            <TabsTrigger value="files" className="flex-1">Files</TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 pt-4">
            {editMode ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Task description..."
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleSelectChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">Todo</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => handleSelectChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      name="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="assigned_to">Assigned To</Label>
                    <Select 
                      value={formData.assigned_to || ''}
                      onValueChange={(value) => handleSelectChange('assigned_to', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {profiles.map(profile => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.first_name} {profile.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    id="client_visible"
                    name="client_visible"
                    type="checkbox"
                    checked={formData.client_visible}
                    onChange={(e) => handleCheckboxChange('client_visible', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="client_visible">Visible to Client</Label>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Task Description */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                  <div className="prose max-w-none">
                    {task?.description ? (
                      <p className="whitespace-pre-wrap">{task.description}</p>
                    ) : (
                      <p className="text-muted-foreground italic">No description</p>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {/* Task Details Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h3>
                    <p className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {task?.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                    <p className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {task?.created_at ? new Date(task.created_at).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                {/* Assignees */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Assignees</h3>
                  {assignees.length > 0 ? (
                    <div className="space-y-2">
                      {assignees.map((assignee) => (
                        <div key={assignee.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                          <Avatar className="h-8 w-8">
                            {assignee.avatar_url ? (
                              <AvatarImage src={assignee.avatar_url} alt={`${assignee.first_name || ''} ${assignee.last_name || ''}`} />
                            ) : (
                              <AvatarFallback>
                                {getInitials(assignee.first_name, assignee.last_name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{assignee.first_name} {assignee.last_name}</p>
                            {assignee.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{assignee.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No assignees</p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Time Tracking Tab */}
          <TabsContent value="time" className="space-y-4 pt-4">
            <TaskTimer taskId={taskId} />
          </TabsContent>
          
          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4 pt-4">
            <TaskAttachments taskId={taskId} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default TaskSidePanel;
