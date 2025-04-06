
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  PlusCircle, 
  CheckCircle2, 
  CircleDashed, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Trash2, 
  Edit 
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Task form schema
const taskSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']),
  due_date: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'completed']),
});

// Task type matching our database schema
type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: string;
  status: string;
  assigned_to: string | null;
  campaign_id: string | null;
  created_at: string;
  updated_at: string;
};

const TasksPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Form for creating/editing tasks
  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium' as const,
      due_date: '',
      status: 'todo' as const,
    },
  });
  
  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
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
  
  // Create task mutation
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof taskSchema>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            ...values,
            assigned_to: user?.id,
          },
        ])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Task created',
        description: 'Your task has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsCreating(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error creating task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof taskSchema> & { id: string }) => {
      const { id, ...taskData } = values;
      const { data, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Task updated',
        description: 'Your task has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsEditing(false);
      setCurrentTask(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Task deleted',
        description: 'Your task has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setCurrentTask(null);
    },
    onError: (error) => {
      toast({
        title: 'Error deleting task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Submit handler for the form
  const onSubmit = (values: z.infer<typeof taskSchema>) => {
    if (isEditing && currentTask) {
      updateMutation.mutate({ ...values, id: currentTask.id });
    } else {
      createMutation.mutate(values);
    }
  };
  
  // Edit task
  const handleEdit = (task: Task) => {
    form.reset({
      title: task.title,
      description: task.description || '',
      priority: task.priority as 'high' | 'medium' | 'low',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      status: task.status as 'todo' | 'in_progress' | 'completed',
    });
    setCurrentTask(task);
    setIsEditing(true);
  };
  
  // Delete task
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };
  
  // Update task status directly
  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId);
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      toast({
        title: 'Status updated',
        description: `Task status set to ${status}.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Filter tasks by status
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  
  // Helper function for priority badge
  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add the details for your new task here.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter task description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" onClick={() => form.reset()}>Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating...' : 'Create Task'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <Tabs defaultValue="todo" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="todo">
              To Do <Badge variant="secondary" className="ml-2">{todoTasks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress <Badge variant="secondary" className="ml-2">{inProgressTasks.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed <Badge variant="secondary" className="ml-2">{completedTasks.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="todo">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todoTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUpdateStatus={updateTaskStatus}
                />
              ))}
              {todoTasks.length === 0 && (
                <div className="col-span-full flex justify-center p-8 text-gray-500">
                  No tasks to do
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="in_progress">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgressTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUpdateStatus={updateTaskStatus}
                />
              ))}
              {inProgressTasks.length === 0 && (
                <div className="col-span-full flex justify-center p-8 text-gray-500">
                  No tasks in progress
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUpdateStatus={updateTaskStatus}
                />
              ))}
              {completedTasks.length === 0 && (
                <div className="col-span-full flex justify-center p-8 text-gray-500">
                  No completed tasks
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the details for your task here.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter task description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setCurrentTask(null);
                    form.reset();
                  }}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Task card component
const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete,
  onUpdateStatus
}: { 
  task: Task, 
  onEdit: (task: Task) => void,
  onDelete: (id: string) => void,
  onUpdateStatus: (id: string, status: string) => void
}) => {
  // Format date to be more readable
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Status icon based on current status
  const getStatusIcon = () => {
    switch(task.status) {
      case 'todo':
        return <CircleDashed className="h-5 w-5" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <CircleDashed className="h-5 w-5" />;
    }
  };
  
  // Priority badge
  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {getStatusIcon()}
            <CardTitle className="ml-2 text-lg">{task.title}</CardTitle>
          </div>
          <div className="flex space-x-1">
            <Button size="icon" variant="ghost" onClick={() => onEdit(task)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete(task.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500 mb-2">{task.description || 'No description provided'}</div>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
            <span className="text-xs text-gray-500">{formatDate(task.due_date)}</span>
          </div>
          {getPriorityBadge(task.priority)}
        </div>
        
        {/* Quick status update buttons */}
        <div className="mt-4 flex gap-2">
          {task.status !== 'todo' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onUpdateStatus(task.id, 'todo')}
              className="flex-1"
            >
              <CircleDashed className="h-4 w-4 mr-1" /> To Do
            </Button>
          )}
          
          {task.status !== 'in_progress' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onUpdateStatus(task.id, 'in_progress')}
              className="flex-1"
            >
              <Clock className="h-4 w-4 mr-1" /> In Progress
            </Button>
          )}
          
          {task.status !== 'completed' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onUpdateStatus(task.id, 'completed')}
              className="flex-1"
            >
              <CheckCircle2 className="h-4 w-4 mr-1" /> Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TasksPage;
