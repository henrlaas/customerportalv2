import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckSquare, 
  Plus,
  Search,
  Calendar,
  Clock,
  Tag,
  User,
  MoreVertical,
  Trash2,
  Edit,
  CheckCircle2,
  Circle,
  ArrowUpRight
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Task form schema
const taskSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  due_date: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']),
  status: z.enum(['todo', 'in_progress', 'completed']),
  assigned_to: z.string().optional(),
  related_to: z.object({
    type: z.enum(['company', 'deal', 'contact', 'none']).default('none'),
    id: z.string().optional(),
  }).optional(),
});

// Task type matching our database schema
type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'completed';
  assigned_to: string | null;
  related_to: {
    type: 'company' | 'deal' | 'contact' | 'none';
    id: string | null;
  } | null;
  created_at: string;
  updated_at: string;
  created_by: string;
};

// Company type for selecting related companies
type Company = {
  id: string;
  name: string;
};

// Deal type for selecting related deals
type Deal = {
  id: string;
  title: string;
};

// Contact type for selecting related contacts
type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

// User/Profile type for assigning tasks
type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

const TasksPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  
  const { toast } = useToast();
  const { isAdmin, isEmployee, user } = useAuth();
  const queryClient = useQueryClient();
  
  // Form for creating/editing tasks
  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      due_date: '',
      priority: 'medium' as const,
      status: 'todo' as const,
      assigned_to: '',
      related_to: {
        type: 'none' as const,
        id: '',
      },
    },
  });
  
  // Fetch tasks
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
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
  
  // Fetch companies for the dropdown
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
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
  
  // Fetch deals for the dropdown
  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('id, title')
        .order('title');
      
      if (error) {
        toast({
          title: 'Error fetching deals',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Deal[];
    },
  });
  
  // Fetch contacts for the dropdown
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, email')
        .order('last_name');
      
      if (error) {
        toast({
          title: 'Error fetching contacts',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Contact[];
    },
  });
  
  // Fetch users/profiles
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .order('first_name');
      
      if (error) {
        toast({
          title: 'Error fetching users',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Profile[];
    },
  });
  
  // Create task mutation
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof taskSchema>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: values.title,
          description: values.description || null,
          due_date: values.due_date || null,
          priority: values.priority,
          status: values.status,
          assigned_to: values.assigned_to || null,
          related_to: values.related_to?.type !== 'none' ? values.related_to : null,
          created_by: user?.id,
        }])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Task created',
        description: 'The task has been created successfully.',
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
        .update({
          title: taskData.title,
          description: taskData.description || null,
          due_date: taskData.due_date || null,
          priority: taskData.priority,
          status: taskData.status,
          assigned_to: taskData.assigned_to || null,
          related_to: taskData.related_to?.type !== 'none' ? taskData.related_to : null,
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Task updated',
        description: 'The task has been updated successfully.',
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
        description: 'The task has been deleted successfully.',
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
  
  // Update task status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'todo' | 'in_progress' | 'completed' }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating task status',
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
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      priority: task.priority,
      status: task.status,
      assigned_to: task.assigned_to || '',
      related_to: task.related_to || {
        type: 'none',
        id: '',
      },
    });
    setCurrentTask(task);
    setIsEditing(true);
  };
  
  // Delete task
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };
  
  // Toggle task status
  const toggleTaskStatus = (task: Task) => {
    let newStatus: 'todo' | 'in_progress' | 'completed';
    
    if (task.status === 'todo') {
      newStatus = 'in_progress';
    } else if (task.status === 'in_progress') {
      newStatus = 'completed';
    } else {
      newStatus = 'todo';
    }
    
    updateStatusMutation.mutate({
      id: task.id,
      status: newStatus,
    });
  };
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Invalid date';
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Get user name by ID
  const getAssigneeName = (userId: string | null) => {
    if (!userId) return 'Unassigned';
    const profile = profiles.find(p => p.id === userId);
    if (!profile) return 'Unknown User';
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
  };
  
  // Get related entity name
  const getRelatedEntityName = (relatedTo: Task['related_to']) => {
    if (!relatedTo || relatedTo.type === 'none' || !relatedTo.id) return null;
    
    switch (relatedTo.type) {
      case 'company':
        const company = companies.find(c => c.id === relatedTo.id);
        return company ? { name: company.name, type: 'Company' } : null;
      case 'deal':
        const deal = deals.find(d => d.id === relatedTo.id);
        return deal ? { name: deal.title, type: 'Deal' } : null;
      case 'contact':
        const contact = contacts.find(c => c.id === relatedTo.id);
        return contact ? { 
          name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email || 'Contact', 
          type: 'Contact' 
        } : null;
      default:
        return null;
    }
  };
  
  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return null;
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return <Circle className="h-5 w-5 text-gray-400" />;
      case 'in_progress':
        return <Circle className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };
  
  // Filter tasks by status (if tab selected) and search query
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = activeTab === 'all' || task.status === activeTab;
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });
  
  // Check if user can modify tasks (admin or employee)
  const canModify = isAdmin || isEmployee;
  
  // Count tasks by status
  const taskCounts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };
  
  // Get related entity options for the form
  const relatedType = form.watch('related_to.type');
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        {canModify && (
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your list.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Call client about proposal" {...field} />
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
                          <Textarea 
                            placeholder="Add details about the task"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
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
                  <FormField
                    control={form.control}
                    name="assigned_to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned To</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Assign to (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Unassigned</SelectItem>
                            {profiles.map(profile => (
                              <SelectItem key={profile.id} value={profile.id}>
                                {`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="related_to.type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Related To</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue('related_to.id', '');
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select relation type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Not Related</SelectItem>
                              <SelectItem value="company">Company</SelectItem>
                              <SelectItem value="deal">Deal</SelectItem>
                              <SelectItem value="contact">Contact</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {relatedType !== 'none' && (
                      <FormField
                        control={form.control}
                        name="related_to.id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select {relatedType}</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={`Select a ${relatedType}`} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {relatedType === 'company' && companies.map(company => (
                                  <SelectItem key={company.id} value={company.id}>
                                    {company.name}
                                  </SelectItem>
                                ))}
                                {relatedType === 'deal' && deals.map(deal => (
                                  <SelectItem key={deal.id} value={deal.id}>
                                    {deal.title}
                                  </SelectItem>
                                ))}
                                {relatedType === 'contact' && contacts.map(contact => (
                                  <SelectItem key={contact.id} value={contact.id}>
                                    {`${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email || contact.id}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
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
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-4 w-full sm:w-[500px]">
            <TabsTrigger value="all">
              All ({taskCounts.all})
            </TabsTrigger>
            <TabsTrigger value="todo">
              To Do ({taskCounts.todo})
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress ({taskCounts.in_progress})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({taskCounts.completed})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {isLoadingTasks ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No tasks found. Add your first task to get started.
            </div>
          ) : (
            filteredTasks.map(task => (
              <Card key={task.id} className="overflow-hidden">
                <div className="flex items-start p-4">
                  <button 
                    onClick={() => toggleTaskStatus(task)}
                    className="mt-1 mr-3 flex-shrink-0"
                  >
                    {getStatusIcon(task.status)}
                  </button>
                  
                  <div className="flex-grow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="mt-1 text-sm text-gray-600">
                            {task.description}
                          </p>
                        )}
                      </div>
                      
                      {canModify && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(task)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(task.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                      {task.due_date && (
                        <div className="flex items-center text-gray-600">
                          <Calendar className="mr-1 h-4 w-4" />
                          {formatDate(task.due_date)}
                        </div>
                      )}
                      
                      <div className="flex items-center text-gray-600">
                        <User className="mr-1 h-4 w-4" />
                        {getAssigneeName(task.assigned_to)}
                      </div>
                      
                      <div>
                        {getPriorityBadge(task.priority)}
                      </div>
                      
                      {task.related_to && task.related_to.type !== 'none' && (
                        <div className="flex items-center">
                          {getRelatedEntityName(task.related_to) && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <ArrowUpRight className="h-3 w-3" />
                              {getRelatedEntityName(task.related_to)?.type}: {getRelatedEntityName(task.related_to)?.name}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the task information.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Call client about proposal" {...field} />
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
                      <Textarea 
                        placeholder="Add details about the task"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
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
              </div>
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
              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {profiles.map(profile => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="related_to.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related To</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue('related_to.id', '');
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relation type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Not Related</SelectItem>
                          <SelectItem value="company">Company</SelectItem>
                          <SelectItem value="deal">Deal</SelectItem>
                          <SelectItem value="contact">Contact</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {relatedType !== 'none' && (
                  <FormField
                    control={form.control}
                    name="related_to.id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select {relatedType}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={`Select a ${relatedType}`} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {relatedType === 'company' && companies.map(company => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                            {relatedType === 'deal' && deals.map(deal => (
                              <SelectItem key={deal.id} value={deal.id}>
                                {deal.title}
                              </SelectItem>
                            ))}
                            {relatedType === 'contact' && contacts.map(contact => (
                              <SelectItem key={contact.id} value={contact.id}>
                                {`${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.email || contact.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
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

export default TasksPage;
