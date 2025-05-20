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
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { MultiAssigneeSelect } from './MultiAssigneeSelect';
import { useAuth } from '@/contexts/AuthContext';
import { CompanySelector } from './CompanySelector';
import { useCompanyList } from '@/hooks/useCompanyList';
import { Company } from '@/types/company';
import { cn } from '@/lib/utils';
import { Project } from '@/types/timeTracking';

// Define types
type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
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
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in_progress', 'completed']),
  due_date: z.string().optional(),
  assignees: z.array(z.string()).optional(),
  campaign_id: z.string().optional(),
  client_visible: z.boolean().default(false),
  related_type: z.enum(['none', 'campaign', 'project']).default('none'),
  company_id: z.string().nullable().optional(),
  project_id: z.string().nullable().optional(), // Added project_id field
});

export const TaskForm: React.FC<TaskFormProps> = ({
  onSuccess,
  taskId,
  initialData,
  profiles,
  campaigns,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditing = !!taskId;
  const [loadingAssignees, setLoadingAssignees] = useState(isEditing);
  const [showSubsidiaries, setShowSubsidiaries] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  // Fetch companies
  const { companies, isLoading: isLoadingCompanies } = useCompanyList(showSubsidiaries);

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
      assignees: loadingAssignees ? [] : existingAssignees,
      campaign_id: initialData?.campaign_id || '',
      client_visible: initialData?.client_visible || false,
      related_type: initialData?.related_type || 'none',
      company_id: initialData?.company_id || null,
      project_id: initialData?.project_id || null,
    },
  });

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
    enabled: !!selectedCompanyId, // Only run query if company is selected
  });

  // Filter campaigns based on selected company
  const filteredCampaigns = campaigns.filter(campaign => 
    !selectedCompanyId || campaign.company_id === selectedCompanyId
  );

  // Update assignees when they're loaded
  useEffect(() => {
    if (!loadingAssignees) {
      form.setValue('assignees', existingAssignees);
    }
  }, [loadingAssignees, existingAssignees, form]);

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
        creator_id: user?.id || null, // Set creator_id to current user ID
        campaign_id: data.related_type === 'campaign' ? data.campaign_id : null,
        project_id: data.related_type === 'project' ? data.project_id : null, // Set project_id if related_type is 'project'
        client_visible: data.client_visible,
        related_type: data.related_type === 'none' ? null : data.related_type,
        company_id: data.company_id || null,
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
                        {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
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
                    showSubsidiaries={showSubsidiaries}
                    onToggleSubsidiaries={setShowSubsidiaries}
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

        {/* Only show Related To field when a company is selected */}
        {selectedCompanyId && (
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
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Show Campaign selector when related_type is 'campaign' and a company is selected */}
        {selectedCompanyId && relatedType === 'campaign' && (
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
                    {filteredCampaigns.length === 0 ? (
                      <SelectItem value="no-campaigns" disabled>No campaigns available for this company</SelectItem>
                    ) : (
                      filteredCampaigns.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Show Project selector when related_type is 'project' and a company is selected */}
        {selectedCompanyId && relatedType === 'project' && (
          <FormField
            control={form.control}
            name="project_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingProjects ? (
                      <SelectItem value="loading" disabled>Loading projects...</SelectItem>
                    ) : projects.length === 0 ? (
                      <SelectItem value="no-projects" disabled>No projects available for this company</SelectItem>
                    ) : (
                      projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))
                    )}
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
            disabled={taskMutation.isPending}
          >
            {isEditing ? (
              taskMutation.isPending ? "Updating..." : "Update Task"
            ) : (
              taskMutation.isPending ? "Creating..." : "Create Task"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaskForm;
