
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

// Time entry form schema
const timeEntrySchema = z.object({
  description: z.string().min(1, { message: 'Description is required' }),
  start_time: z.string().min(1, { message: 'Start time is required' }),
  end_time: z.string().min(1, { message: 'End time is required' }),
  is_billable: z.boolean().default(true),
});

type ProjectTimeEntryDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  companyId?: string;
};

export const ProjectTimeEntryDialog = ({
  isOpen,
  onClose,
  projectId,
  companyId,
}: ProjectTimeEntryDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Format dates properly for input fields
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().substring(0, 16);
  };

  // Form for creating time entries
  const form = useForm({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      description: '',
      start_time: formatDateForInput(new Date()),
      end_time: formatDateForInput(new Date()),
      is_billable: true,
    },
  });

  // Create time entry mutation
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof timeEntrySchema>) => {
      if (!user) throw new Error('You must be logged in to create time entries');
      
      console.log('Creating time entry for project:', projectId);
      
      // Prepare a clean object with time entry data
      const timeEntryData = {
        description: values.description,
        start_time: values.start_time,
        end_time: values.end_time,
        user_id: user.id,
        is_billable: values.is_billable,
        project_id: projectId,
        company_id: companyId || null,
      };
      
      const { data, error } = await supabase
        .from('time_entries')
        .insert(timeEntryData)
        .select();
      
      if (error) throw error;
      console.log('Time entry created successfully:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Time entry creation successful, invalidating queries for project:', projectId);
      
      // First close the dialog
      onClose();
      
      // Then show success message and invalidate queries
      toast({
        title: 'Time entry created',
        description: 'Your time entry has been created successfully.',
      });
      
      // Invalidate the CORRECT query key used by ProjectTimeTrackingTab
      queryClient.invalidateQueries({ queryKey: ['project-time-entries-enhanced', projectId] });
      
      // Also invalidate other time entry related queries for completeness
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['project-time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['project-time-entries', projectId] });
      queryClient.invalidateQueries({ queryKey: ['monthlyHours'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-time-entries'] });
      
      console.log('All time entry queries invalidated');
      
      // Reset the form
      form.reset({
        description: '',
        start_time: formatDateForInput(new Date()),
        end_time: formatDateForInput(new Date()),
        is_billable: true,
      });
    },
    onError: (error: any) => {
      console.error('Error creating time entry:', error);
      toast({
        title: 'Error creating time entry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Submit handler for the form
  const onSubmit = (values: z.infer<typeof timeEntrySchema>) => {
    console.log('Submitting time entry form with values:', values);
    createMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Project Time Entry</DialogTitle>
          <DialogDescription>
            Add time spent on this project. This will be automatically associated with the current project.
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

            <FormField
              control={form.control}
              name="is_billable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Billable</FormLabel>
                    <FormDescription>
                      Mark this time entry as billable
                    </FormDescription>
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

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Saving...' : 'Create Entry'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
