
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Play, 
  Pause, 
  Clock, 
  Calendar, 
  Trash2, 
  Edit, 
  PlusCircle,
  Search
} from 'lucide-react';
import { format, formatDistance, differenceInSeconds } from 'date-fns';
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

// Time entry form schema
const timeEntrySchema = z.object({
  description: z.string().optional(),
  start_time: z.string().min(1, { message: 'Start time is required' }),
  end_time: z.string().optional(),
  task_id: z.string().optional(),
});

// Time entry type matching our database schema
type TimeEntry = {
  id: string;
  user_id: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  task_id: string | null;
  created_at: string;
  updated_at: string;
};

// Task type for selecting related tasks
type Task = {
  id: string;
  title: string;
};

const TimeTrackingPage = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Form for creating/editing time entries
  const form = useForm({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      description: '',
      start_time: new Date().toISOString(),
      end_time: '',
      task_id: undefined,
    },
  });
  
  // Fetch time entries
  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });
      
      if (error) {
        toast({
          title: 'Error fetching time entries',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      // Check if there's any active time entry (without end_time)
      const active = data.find(entry => !entry.end_time);
      if (active) {
        setIsTracking(true);
        setActiveEntry(active);
      }
      
      return data as TimeEntry[];
    },
    enabled: !!user,
  });
  
  // Fetch tasks for the dropdown
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title')
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
  
  // Create time entry mutation
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof timeEntrySchema>) => {
      if (!user) throw new Error('You must be logged in to create time entries');
      
      const { data, error } = await supabase
        .from('time_entries')
        .insert([
          {
            ...values,
            user_id: user.id,
          },
        ])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Time entry created',
        description: 'Your time entry has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      setIsCreating(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error creating time entry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update time entry mutation
  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof timeEntrySchema> & { id: string }) => {
      const { id, ...entryData } = values;
      const { data, error } = await supabase
        .from('time_entries')
        .update(entryData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Time entry updated',
        description: 'Your time entry has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      setIsEditing(false);
      setCurrentEntry(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error updating time entry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete time entry mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Time entry deleted',
        description: 'Your time entry has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      setCurrentEntry(null);
    },
    onError: (error) => {
      toast({
        title: 'Error deleting time entry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Start time tracking
  const startTracking = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to track time.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([
          {
            user_id: user.id,
            start_time: new Date().toISOString(),
            description: 'Time tracking session',
          },
        ])
        .select();
      
      if (error) throw error;
      
      setIsTracking(true);
      setActiveEntry(data[0]);
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      
      toast({
        title: 'Time tracking started',
        description: 'Your timer has started.',
      });
    } catch (error: any) {
      toast({
        title: 'Error starting timer',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Stop time tracking
  const stopTracking = async () => {
    if (!activeEntry) return;
    
    try {
      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: new Date().toISOString(),
        })
        .eq('id', activeEntry.id);
      
      if (error) throw error;
      
      setIsTracking(false);
      setActiveEntry(null);
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      
      toast({
        title: 'Time tracking stopped',
        description: 'Your timer has been stopped.',
      });
    } catch (error: any) {
      toast({
        title: 'Error stopping timer',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Submit handler for the form
  const onSubmit = (values: z.infer<typeof timeEntrySchema>) => {
    if (isEditing && currentEntry) {
      updateMutation.mutate({ ...values, id: currentEntry.id });
    } else {
      createMutation.mutate(values);
    }
  };
  
  // Edit time entry
  const handleEdit = (entry: TimeEntry) => {
    form.reset({
      description: entry.description || '',
      start_time: entry.start_time,
      end_time: entry.end_time || '',
      task_id: entry.task_id || undefined,
    });
    setCurrentEntry(entry);
    setIsEditing(true);
  };
  
  // Delete time entry
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };
  
  // Update elapsed time for active time entry
  useEffect(() => {
    if (!isTracking || !activeEntry) return;
    
    const interval = setInterval(() => {
      const start = new Date(activeEntry.start_time).getTime();
      const now = new Date().getTime();
      setElapsedTime(Math.floor((now - start) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isTracking, activeEntry]);
  
  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Calculate duration between start and end time
  const calculateDuration = (start: string, end: string | null) => {
    if (!end) return 'In progress';
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const seconds = differenceInSeconds(endDate, startDate);
    
    return formatDuration(seconds);
  };

  // Filter entries by search query
  const filteredEntries = timeEntries.filter(entry => 
    entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.task_id && tasks.find(task => task.id === entry.task_id)?.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Time Tracking</h1>
        <div className="flex gap-2">
          {isTracking ? (
            <Button variant="destructive" onClick={stopTracking}>
              <Pause className="mr-2 h-4 w-4" />
              Stop ({formatDuration(elapsedTime)})
            </Button>
          ) : (
            <Button onClick={startTracking}>
              <Play className="mr-2 h-4 w-4" />
              Start Timer
            </Button>
          )}
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Manual Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Time Entry</DialogTitle>
                <DialogDescription>
                  Add a manual time entry with specific start and end times.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="What were you working on?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="task_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related Task</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Link to a task (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">No related task</SelectItem>
                            {tasks.map(task => (
                              <SelectItem key={task.id} value={task.id}>
                                {task.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="end_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" onClick={() => form.reset()}>Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Creating...' : 'Create Entry'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search time entries..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No time entries found. Start tracking your time or add a manual entry.
            </div>
          ) : (
            filteredEntries.map(entry => (
              <Card key={entry.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {entry.description || 'Time entry'}
                    </CardTitle>
                    <div className="flex space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(entry)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Start Time</div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {format(new Date(entry.start_time), 'MMM d, yyyy HH:mm')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">End Time</div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {entry.end_time 
                          ? format(new Date(entry.end_time), 'MMM d, yyyy HH:mm')
                          : 'In progress'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="flex items-center font-medium">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {entry.end_time 
                        ? calculateDuration(entry.start_time, entry.end_time)
                        : 'In progress'}
                    </div>
                  </div>
                  
                  {entry.task_id && (
                    <div className="mt-4 text-sm">
                      <span className="text-gray-500">Task: </span>
                      <span className="font-medium">
                        {tasks.find(task => task.id === entry.task_id)?.title || 'Unknown task'}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
      
      {/* Edit Time Entry Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
            <DialogDescription>
              Update the details for your time entry.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What were you working on?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="task_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Task</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Link to a task (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No related task</SelectItem>
                        {tasks.map(task => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setCurrentEntry(null);
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

export default TimeTrackingPage;
