
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiAssigneeSelect } from './MultiAssigneeSelect';
import { useAuth } from '@/contexts/AuthContext';
import { CompanySelector } from './CompanySelector';
import { CompactRelationSelector } from './CompactRelationSelector';
import { useCompanyList } from '@/hooks/useCompanyList';
import { Company } from '@/types/company';
import { cn } from '@/lib/utils';
import { Project } from '@/types/timeTracking';

// Define types - updated Contact type to include role
type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
  role: string;
};

// Ensure Campaign type includes the company_id property
type Campaign = {
  id: string;
  name: string;
  company_id: string;
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
  title: z.string().min(1, {
    message: 'Title is required'
  }),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in_progress', 'completed']),
  due_date: z.string().optional(),
  assignees: z.array(z.string()).optional(),
  campaign_id: z.string().optional(),
  client_visible: z.boolean().default(false),
  related_type: z.enum(['none', 'campaign', 'project']).default('none'),
  company_id: z.string().nullable().optional(),
  project_id: z.string().nullable().optional()
});

export const TaskForm: React.FC<TaskFormProps> = ({
  onSuccess,
  taskId,
  initialData,
  profiles,
  campaigns
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditing = !!taskId;
  const [loadingAssignees, setLoadingAssignees] = useState(isEditing);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  // Fetch companies - always show all including subsidiaries
  const { companies, isLoading: isLoadingCompanies } = useCompanyList(true);

  // Fetch existing task assignees if editing
  const [existingAssignees, setExistingAssignees] = useState<string[]>([]);
  useEffect(() => {
    if (isEditing && taskId) {
      const fetchTaskAssignees = async () => {
        try {
          const { data, error } = await supabase
            .from('task_assignees')
            .select('user_id')
            .eq('task_id', taskId);
          
          if (error) throw error;
          
          if (data) {
            const assigneeIds = data.map(record => record.user_id);
            setExistingAssignees(assigneeIds);
          }
        } catch (error) {
          console.error('Error fetching task assignees:', error);
        } finally {
          setLoadingAssignees(false);
        }
      };
      fetchTaskAssignees();
    } else {
      setLoadingAssignees(false);
    }
  }, [isEditing, taskId]);

  // Set up the form
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'medium',
      status: initialData?.status || 'todo',
      due_date: initialData?.due_date || '',
      assignees: loadingAssignees ? [] : (isEditing ? existingAssignees : (user?.id ? [user.id] : [])),
      campaign_id: initialData?.campaign_id || '',
      client_visible: initialData?.client_visible || false,
      related_type: initialData?.related_type || 'none',
      company_id: initialData?.company_id || null,
      project_id: initialData?.project_id || null
    }
  });

  // Helper functions for colored select styling
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return '';
    }
  };

  // Watch for status and priority changes to apply colors
  const selectedStatus = form.watch('status');
  const selectedPriority = form.watch('priority');

  // Watch for company_id changes to filter campaigns and projects
  const selectedCompanyId = form.watch('company_id');
  const relatedType = form.watch('related_type');

  // Fetch projects based on selected company
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, company_id')
        .eq('company_id', selectedCompanyId)
        .order('name');
      
      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error fetching projects',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as Project[];
    },
    enabled: !!selectedCompanyId
  });

  // Filter campaigns based on selected company
  const filteredCampaigns = campaigns.filter(campaign => 
    !selectedCompanyId || campaign.company_id === selectedCompanyId
  );

  // Update assignees when they're loaded
  useEffect(() => {
    if (!loadingAssignees) {
      form.setValue('assignees', isEditing ? existingAssignees : (user?.id ? [user.id] : []));
    }
  }, [loadingAssignees, existingAssignees, form, user?.id, isEditing]);

  // Reset related fields when company changes
  useEffect(() => {
    if (form.getValues('related_type') !== 'none') {
      form.setValue('campaign_id', '');
      form.setValue('project_id', '');
      form.setValue('related_type', 'none');
    }
  }, [selectedCompanyId, form]);

  // Create or update task mutation
  const taskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof taskSchema>) => {
      console.log("Starting task mutation with data:", data);

      // Clear any previous timeout
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        setTimeoutId(null);
      }

      // Set a timeout to abort if the operation takes too long
      const timeoutPromise = new Promise((_, reject) => {
        const id = window.setTimeout(() => {
          reject(new Error('Operation timed out after 15 seconds'));
        }, 15000);
        setTimeoutId(Number(id));
      });

      // Prepare the data for insertion
      const taskData = {
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        status: data.status,
        due_date: data.due_date || null,
        creator_id: user?.id || null,
        campaign_id: data.related_type === 'campaign' ? data.campaign_id : null,
        project_id: data.related_type === 'project' ? data.project_id : null,
        client_visible: data.client_visible,
        related_type: data.related_type === 'none' ? null : data.related_type,
        company_id: data.company_id || null
      };

      let taskResult;
      
      try {
        // Create or update the task
        if (isEditing) {
          console.log(`Updating task with ID: ${taskId}`);
          const { data: result, error } = await supabase
            .from('tasks')
            .update(taskData)
            .eq('id', taskId)
            .select()
            .single();
          
          if (error) throw error;
          taskResult = result;
          console.log("Task updated successfully:", taskResult);
        } else {
          console.log("Creating new task");
          const { data: result, error } = await supabase
            .from('tasks')
            .insert(taskData)
            .select()
            .single();
          
          if (error) throw error;
          taskResult = result;
          console.log("Task created successfully:", taskResult);
        }

        // Now handle assignees - first remove existing assignees if updating
        if (isEditing && taskId) {
          console.log(`Removing existing assignees for task: ${taskId}`);
          const { error: deleteError } = await supabase
            .from('task_assignees')
            .delete()
            .eq('task_id', taskId);
          
          if (deleteError) throw deleteError;
        }

        // Insert new assignees
        if (data.assignees && data.assignees.length > 0 && taskResult && taskResult.id) {
          const assigneesData = data.assignees.map(userId => ({
            task_id: isEditing ? taskId : taskResult.id,
            user_id: userId
          }));
          
          console.log(`Adding ${assigneesData.length} assignees`);
          const { error: assignError } = await supabase
            .from('task_assignees')
            .insert(assigneesData);
          
          if (assignError) throw assignError;
        }

        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
          setTimeoutId(null);
        }

        return taskResult;
      } catch (error) {
        console.error("Error in task mutation:", error);
        throw error;
      }
    },
    onSuccess: (result) => {
      toast({
        title: isEditing ? 'Task updated' : 'Task created',
        description: isEditing ? 'Your task has been updated' : 'Your task has been created',
      });
      console.log("Task mutation completed successfully", result);
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      console.error("Task mutation error:", error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} task: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Submit handler
  const onSubmit = (data: z.infer<typeof taskSchema>) => {
    console.log("Submitting form with data:", data);
    // Show immediate feedback to the user
    toast({
      title: isEditing ? 'Updating Task...' : 'Creating Task...',
      description: 'Please wait while we save your changes...',
    });
    taskMutation.mutate(data);
  };

  if (loadingAssignees) {
    return <div>Loading task details...</div>;
  }

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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className={cn("transition-colors", getStatusColor(selectedStatus))}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="todo" className="text-gray-600 focus:bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
                        Todo
                      </div>
                    </SelectItem>
                    <SelectItem value="in_progress" className="text-blue-600 focus:bg-blue-50">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                        In Progress
                      </div>
                    </SelectItem>
                    <SelectItem value="completed" className="text-green-600 focus:bg-green-50">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        Completed
                      </div>
                    </SelectItem>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className={cn("transition-colors", getPriorityColor(selectedPriority))}>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low" className="text-green-600 focus:bg-green-50">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        Low
                      </div>
                    </SelectItem>
                    <SelectItem value="medium" className="text-yellow-600 focus:bg-yellow-50">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="high" className="text-red-600 focus:bg-red-50">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                        High
                      </div>
                    </SelectItem>
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          "flex h-10 rounded-md border border-input bg-background px-3 py-2",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-70" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 shadow-md border border-input rounded-md bg-background" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(format(date, "yyyy-MM-dd"));
                          }
                        }}
                        initialFocus
                        className="p-3 pointer-events-auto rounded-md"
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <CompanySelector
                    companies={companies}
                    selectedCompanyId={field.value || null}
                    onSelect={(companyId) => field.onChange(companyId)}
                    isLoading={isLoadingCompanies}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="assignees"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignees</FormLabel>
              <FormControl>
                <MultiAssigneeSelect
                  users={profiles}
                  selectedUserIds={field.value || []}
                  onChange={field.onChange}
                  placeholder="Select assignees"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Show CompactRelationSelector when a company is selected */}
        {selectedCompanyId && (
          <CompactRelationSelector
            relatedType={relatedType}
            onRelatedTypeChange={(type) => {
              form.setValue('related_type', type);
              form.setValue('campaign_id', '');
              form.setValue('project_id', '');
            }}
            campaigns={filteredCampaigns}
            projects={projects}
            selectedCampaignId={form.watch('campaign_id')}
            selectedProjectId={form.watch('project_id')}
            onCampaignChange={(campaignId) => form.setValue('campaign_id', campaignId)}
            onProjectChange={(projectId) => form.setValue('project_id', projectId)}
            isLoadingProjects={isLoadingProjects}
          />
        )}

        <FormField
          control={form.control}
          name="client_visible"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Visible to client</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Make this task visible in the client portal
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={taskMutation.isPending}>
            {isEditing 
              ? (taskMutation.isPending ? "Updating..." : "Update Task")
              : (taskMutation.isPending ? "Creating..." : "Create Task")
            }
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaskForm;
