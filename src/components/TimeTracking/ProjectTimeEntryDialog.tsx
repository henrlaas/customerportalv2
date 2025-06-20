
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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
  FormDescription,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

// Time entry form schema - updated to use Date objects
const timeEntrySchema = z.object({
  description: z.string().min(1, { message: 'Description is required' }),
  start_time: z.date({ required_error: 'Start time is required' }),
  end_time: z.date({ required_error: 'End time is required' }),
  is_billable: z.boolean().default(true),
});

type ProjectTimeEntryDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  companyId?: string;
};

// Enhanced DateTimePicker component
const DateTimePicker = ({ 
  value, 
  onChange, 
  placeholder = "Select date and time" 
}: { 
  value?: Date; 
  onChange: (date: Date | undefined) => void; 
  placeholder?: string;
}) => {
  const [timeValue, setTimeValue] = useState(() => {
    if (value) {
      return format(value, 'HH:mm');
    }
    return '';
  });

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange(undefined);
      return;
    }

    // If we have a time value, apply it to the selected date
    if (timeValue) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    } else {
      // Use current time as default
      const now = new Date();
      const newDate = new Date(selectedDate);
      newDate.setHours(now.getHours(), now.getMinutes(), 0, 0);
      onChange(newDate);
      setTimeValue(format(now, 'HH:mm'));
    }
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);
    
    if (value && time) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    }
  };

  const displayText = value 
    ? `${format(value, 'MMM d, yyyy')} at ${format(value, 'HH:mm')}`
    : placeholder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            className="pointer-events-auto"
          />
          <div className="mt-3 border-t pt-3">
            <label className="block text-sm font-medium mb-2">Time</label>
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
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

  // Form for creating time entries with updated default values
  const form = useForm({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      description: '',
      start_time: new Date(),
      end_time: new Date(),
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
        start_time: values.start_time.toISOString(),
        end_time: values.end_time.toISOString(),
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
        start_time: new Date(),
        end_time: new Date(),
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
            
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select start time"
                      />
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
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select end time"
                      />
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
