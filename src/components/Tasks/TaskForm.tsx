
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
    },
  });

  // Watch for company_id changes to filter campaigns
  const selectedCompanyId = form.watch('company_id');
  const relatedType = form.watch('related_type');

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
    if (form.getValues('related_type') === 'campaign') {
      form.setValue('campaign_id', '');
      form.setValue('related_type', 'none');
    }
  }, [selectedCompanyId, form]);

  // Create or update task mutation
  const taskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof taskSchema>) => {
      // Prepare the data for insertion
      const taskData = {
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        status: data.status,
        due_date: data.due_date || null,
        creator_id: user?.id || null, // Set creator_id to current user ID
        campaign_id: data.related_type === 'campaign' ? data.campaign_id : null,
        client_visible: data.client_visible,
        related_type: data.related_type === 'none' ? null : data.related_type,
        company_id: data.company_id || null, // Add company_id field
      };
      
      let taskResult;
      
      // Create or update the task
      if (isEditing) {
        const { data: result, error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', taskId)
          .select()
          .single();
        
        if (error) throw error;
        taskResult = result;
      } else {
        // Use regular insert instead of insertWithUser if you're setting the creator manually
        const { data: result, error } = await supabase
          .from('tasks')
          .insert(taskData)
          .select()
          .single();
        
        if (error) throw error;
        taskResult = result;
      }
      
      // Now handle assignees - first remove existing assignees if updating
      if (isEditing && taskId) {
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
        
        const { error: assignError } = await supabase
          .from('task_assignees')
          .insert(assigneesData);
        
        if (assignError) throw assignError;
      }
      
      return taskResult;
    },
    onSuccess: () => {
      toast({
        title: isEditing ? 'Task updated' : 'Task created',
        description: isEditing ? 'Your task has been updated' : 'Your task has been created',
      });
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
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
    console.log("Submitting form with data:", data);
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
                  <Input type="date" {...field} value={field.value || ''} />
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
                    <SelectItem value="project">Project (Coming Soon)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Only show Campaign selector when related_type is 'campaign' and a company is selected */}
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
                    {/* If there are no filtered campaigns, provide a default option */}
                    {filteredCampaigns.length === 0 && (
                      <SelectItem value="no-campaigns">No campaigns available for this company</SelectItem>
                    )}
                    {filteredCampaigns.map((campaign) => (
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
