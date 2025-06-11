import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// Define the task schema for simplified form validation
const taskSchema = z.object({
  title: z.string().min(1, {
    message: 'Title is required'
  }),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in_progress', 'completed']),
  due_date: z.string().optional(),
  client_visible: z.boolean().optional()
});
type CreateProjectTaskDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  companyId: string | null;
  projectAssignees: {
    user_id: string;
  }[];
};
export const CreateProjectTaskDialog: React.FC<CreateProjectTaskDialogProps> = ({
  isOpen,
  onClose,
  projectId,
  companyId,
  projectAssignees
}) => {
  const {
    user
  } = useAuth();
  const queryClient = useQueryClient();

  // Set up the form with default values
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      due_date: '',
      client_visible: false
    }
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof taskSchema>) => {
      // Prepare the task data
      const taskData = {
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        status: data.status,
        due_date: data.due_date || null,
        project_id: projectId,
        company_id: companyId,
        creator_id: user?.id || null,
        related_type: 'project'
      };

      // Create the task
      const {
        data: taskResult,
        error
      } = await supabase.from('tasks').insert(taskData).select().single();
      if (error) throw error;

      // If we have project assignees, add them as task assignees
      if (projectAssignees.length > 0 && taskResult) {
        const assigneesData = projectAssignees.map(assignee => ({
          task_id: taskResult.id,
          user_id: assignee.user_id
        }));
        const {
          error: assignError
        } = await supabase.from('task_assignees').insert(assigneesData);
        if (assignError) throw assignError;
      }
      return taskResult;
    },
    onSuccess: () => {
      toast.success('Task created successfully');
      form.reset();
      onClose();
      // Invalidate task queries to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['project-tasks', projectId]
      });
    },
    onError: (error: any) => {
      console.error('Error creating task:', error);
      toast.error(`Failed to create task: ${error.message}`);
    }
  });

  // Submit handler
  const onSubmit = (data: z.infer<typeof taskSchema>) => {
    createTaskMutation.mutate(data);
  };
  return <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({
            field
          }) => <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="description" render={({
            field
          }) => <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Task description" className="min-h-[100px]" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="status" render={({
              field
            }) => <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  </FormItem>} />

              <FormField control={form.control} name="priority" render={({
              field
            }) => <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  </FormItem>} />
            </div>

            <FormField control={form.control} name="due_date" render={({
            field
          }) => <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", "flex h-10 rounded-md border border-input bg-background px-3 py-2", !field.value && "text-muted-foreground")}>
                          {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-70" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 shadow-md border border-input rounded-md bg-background" align="start">
                        <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={date => {
                    if (date) {
                      field.onChange(format(date, "yyyy-MM-dd"));
                    }
                  }} initialFocus className="p-3 pointer-events-auto rounded-md" />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <FormField control={form.control} name="client_visible" render={({
            field
          }) => <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Visible to client</FormLabel>
                    <div className="text-sm text-muted-foreground">Make this task visible in the client portal</div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>} />

            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={createTaskMutation.isPending}>
                {createTaskMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>;
};