
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { supabase, insertWithUser } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from '@/components/ui/multi-select';

// Define types
type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
};

type Campaign = {
  id: string;
  name: string;
};

type TaskFormProps = {
  onSuccess: () => void;
  taskId?: string;
  initialData?: any;
  profiles: Contact[];
  campaigns: Campaign[];
};

// Define the task schema for form validation
const taskSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in_progress', 'completed']),
  due_date: z.string().optional(),
  assignees: z.array(z.string()).optional(),
  campaign_id: z.string().optional(),
  client_visible: z.boolean().default(false),
  related_type: z.enum(['none', 'campaign', 'project']).default('none'),
});

export const TaskForm: React.FC<TaskFormProps> = ({
  onSuccess,
  taskId,
  initialData,
  profiles,
  campaigns,
}) => {
  const { toast } = useToast();
  const isEditing = !!taskId;

  // Fetch current assignees if editing
  const [currentAssignees, setCurrentAssignees] = React.useState<string[]>([]);
  
  useEffect(() => {
    const fetchAssignees = async () => {
      if (!isEditing || !taskId) return;
      
      try {
        // Fetch assignees from task_assignees table
        const { data, error } = await supabase
          .from('task_assignees')
          .select('user_id')
          .eq('task_id', taskId);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setCurrentAssignees(data.map(a => a.user_id));
        } 
        // For backward compatibility, check the legacy assigned_to field
        else if (initialData?.assigned_to) {
          setCurrentAssignees([initialData.assigned_to]);
        }
      } catch (error) {
        console.error('Error fetching task assignees:', error);
      }
    };
    
    fetchAssignees();
  }, [isEditing, taskId, initialData]);
  
  // Set up the form
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'medium',
      status: initialData?.status || 'todo',
      due_date: initialData?.due_date || '',
      assignees: currentAssignees,
      campaign_id: initialData?.campaign_id || '',
      client_visible: initialData?.client_visible || false,
      related_type: initialData?.related_type || 'none',
    },
  });

  // Update form values when currentAssignees changes
  useEffect(() => {
    if (currentAssignees.length > 0) {
      form.setValue('assignees', currentAssignees);
    }
  }, [currentAssignees, form]);

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof taskSchema>) => {
      // Prepare the data for insertion
      const taskData = {
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        status: data.status,
        due_date: data.due_date || null,
        assigned_to: data.assignees && data.assignees.length > 0 ? data.assignees[0] : null, // For backward compatibility
        campaign_id: data.related_type === 'campaign' ? data.campaign_id : null,
        client_visible: data.client_visible,
        related_type: data.related_type === 'none' ? null : data.related_type,
      };
      
      let taskId = isEditing ? taskId : null;
      
      // Create or update the task
      if (isEditing) {
        const { data: result, error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', taskId)
          .select()
          .single();
        
        if (error) throw error;
        taskId = result.id;
      } else {
        const { data: result, error } = await insertWithUser('tasks', taskData);
        if (error) throw error;
        taskId = result[0].id;
      }
      
      // Handle assignees
      if (taskId && data.assignees && data.assignees.length > 0) {
        // If editing, remove existing assignees first
        if (isEditing) {
          const { error: deleteError } = await supabase
            .from('task_assignees')
            .delete()
            .eq('task_id', taskId);
            
          if (deleteError) throw deleteError;
        }
        
        // Add new assignees
        const assigneeInserts = data.assignees.map(userId => ({
          task_id: taskId as string,
          user_id: userId,
        }));
        
        const { error: insertError } = await supabase
          .from('task_assignees')
          .insert(assigneeInserts);
          
        if (insertError) throw insertError;
      }
      
      return taskId;
    },
    onSuccess: () => {
      toast({
        title: isEditing ? 'Task updated' : 'Task created',
        description: isEditing ? 'Your task has been updated' : 'Your task has been created',
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} task: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Submit handler
  const onSubmit = (data: z.infer<typeof taskSchema>) => {
    createTaskMutation.mutate(data);
  };

  // Watch the related type to show/hide campaign selector
  const relatedType = form.watch('related_type');

  // Helper function to format names
  const formatName = (contact: Contact) => {
    return `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unknown User';
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
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
                  placeholder="Task description" 
                  className="min-h-[100px]" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectItem value="todo">Todo</SelectItem>
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
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assignees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignees</FormLabel>
                <FormControl>
                  <MultiSelect
                    value={field.value || []}
                    onValueChange={field.onChange}
                    placeholder="Select assignees"
                  >
                    {profiles.map((profile) => (
                      <MultiSelectItem key={profile.id} value={profile.id}>
                        {formatName(profile)}
                      </MultiSelectItem>
                    ))}
                  </MultiSelect>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="related_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Related To</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Not Related</SelectItem>
                  <SelectItem value="campaign">Campaign</SelectItem>
                  <SelectItem value="project">Project (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {relatedType === 'campaign' && (
          <FormField
            control={form.control}
            name="campaign_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* If there are no campaigns, provide a default option */}
                    {campaigns.length === 0 && (
                      <SelectItem value="no-campaigns">No campaigns available</SelectItem>
                    )}
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="client_visible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer">Visible to client</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Make this task visible in the client portal (Coming soon)
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button 
            type="submit" 
            disabled={createTaskMutation.isPending}
          >
            {isEditing ? (
              createTaskMutation.isPending ? "Updating..." : "Update Task"
            ) : (
              createTaskMutation.isPending ? "Creating..." : "Create Task"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaskForm;
