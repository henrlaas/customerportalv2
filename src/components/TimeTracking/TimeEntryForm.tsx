import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, AlertCircle, ArrowLeft, ArrowRight, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CompanySelector } from '@/components/Tasks/CompanySelector';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { TimeEntry, Task, Campaign, Project } from '@/types/timeTracking';
import { Company as CompanyType } from '@/types/company';
import { ProgressStepper } from '@/components/ui/progress-stepper';
import { useCompanyList } from '@/hooks/useCompanyList';
import { useCompanyTasks, useCompanyCampaigns, useCompanyProjects } from '@/hooks/useOptimizedTimeEntryData';
import ReactSelect from 'react-select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Enhanced time entry form schema with custom validation
const timeEntrySchema = z.object({
  description: z.string().min(1, { message: 'Description is required' }),
  start_time: z.string().min(1, { message: 'Start time is required' }),
  end_time: z.string().min(1, { message: 'End time is required' }),
  task_id: z.string().optional(),
  is_billable: z.boolean().default(false),
  company_id: z.string().optional(),
  campaign_id: z.string().optional(),
  project_id: z.string().optional(),
}).refine((data) => {
  if (data.start_time && data.end_time) {
    const startDate = new Date(data.start_time);
    const endDate = new Date(data.end_time);
    return endDate > startDate;
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["end_time"],
});

type TimeEntryFormProps = {
  isCreating?: boolean;
  isEditing?: boolean;
  setIsCreating?: (value: boolean) => void;
  setIsEditing?: (value: boolean) => void;
  currentEntry?: TimeEntry | null;
  onCancelEdit?: () => void;
  onComplete?: () => void;
  isCompletingTracking?: boolean;
};

export const TimeEntryForm = ({
  isCreating = false,
  isEditing = false,
  setIsCreating = () => {},
  setIsEditing = () => {},
  currentEntry = null,
  onCancelEdit = () => {},
  onComplete = () => {},
  isCompletingTracking = false
}: TimeEntryFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showSubsidiaries, setShowSubsidiaries] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  
  // Enhanced format dates for input fields - handles timezone properly
  const formatDateForInput = useCallback((dateString: string | null) => {
    if (!dateString) return '';
    
    // Create date object from the string
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) return '';
    
    // Format for datetime-local input (YYYY-MM-DDTHH:mm)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }, []);

  // Memoize default values to prevent form re-initialization
  const defaultValues = useMemo(() => ({
    description: currentEntry?.description || '',
    start_time: formatDateForInput(currentEntry?.start_time) || new Date().toISOString().substring(0, 16),
    end_time: formatDateForInput(currentEntry?.end_time) || '',
    task_id: currentEntry?.task_id || undefined,
    is_billable: currentEntry?.is_billable !== undefined ? currentEntry.is_billable : false,
    company_id: currentEntry?.company_id || undefined,
    campaign_id: currentEntry?.campaign_id || undefined,
    project_id: currentEntry?.project_id || undefined,
  }), [currentEntry, formatDateForInput]);

  // Form for creating/editing time entries
  const form = useForm({
    resolver: zodResolver(timeEntrySchema),
    defaultValues,
  });

  // Enhanced DateTimePicker component with proper timezone handling
  const DateTimePicker = ({ field, label }: { field: any; label: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Parse existing value or use current date
    const currentValue = field.value ? new Date(field.value) : new Date();
    const [tempDate, setTempDate] = useState<Date | undefined>(currentValue);
    const [tempTime, setTempTime] = useState(
      field.value 
        ? format(new Date(field.value), 'HH:mm')
        : format(new Date(), 'HH:mm')
    );

    const handleDateSelect = (date: Date | undefined) => {
      if (date) {
        setTempDate(date);
        // Create proper datetime string in local timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const newDateTime = `${year}-${month}-${day}T${tempTime}`;
        field.onChange(newDateTime);
      }
    };

    const handleTimeChange = (time: string) => {
      setTempTime(time);
      if (tempDate) {
        const year = tempDate.getFullYear();
        const month = String(tempDate.getMonth() + 1).padStart(2, '0');
        const day = String(tempDate.getDate()).padStart(2, '0');
        const newDateTime = `${year}-${month}-${day}T${time}`;
        field.onChange(newDateTime);
      }
    };

    // Enhanced display formatting
    const formatDisplayText = (value: string) => {
      if (!value) return '';
      
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-10 text-sm",
              !field.value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {field.value ? formatDisplayText(field.value) : "Pick date & time"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 space-y-3">
            <Calendar
              mode="single"
              selected={tempDate}
              onSelect={handleDateSelect}
              initialFocus
              className="rounded-md border pointer-events-auto"
            />
            <div className="flex items-center space-x-2">
              <label htmlFor="time" className="text-sm font-medium">
                Time:
              </label>
              <Input
                id="time"
                type="time"
                value={tempTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-32"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Get company list with memoized results
  const { companies: allCompanies = [], isLoading: isLoadingCompanies } = useCompanyList(showSubsidiaries);

  // Watch only the company_id field to minimize re-renders
  const selectedCompanyId = form.watch('company_id');
  const isBillable = form.watch('is_billable');
  const selectedTaskId = form.watch('task_id');
  const selectedCampaignId = form.watch('campaign_id');
  const selectedProjectId = form.watch('project_id');
  
  // Use optimized hooks to fetch company-specific data
  const { data: companyTasks = [], isLoading: isLoadingTasks } = useCompanyTasks(selectedCompanyId);
  const { data: companyCampaigns = [], isLoading: isLoadingCampaigns } = useCompanyCampaigns(selectedCompanyId);
  const { data: companyProjects = [], isLoading: isLoadingProjects } = useCompanyProjects(selectedCompanyId);

  // Memoize billable state calculation
  const canBeBillable = useMemo(() => {
    return !!selectedCompanyId && selectedCompanyId !== 'no-company';
  }, [selectedCompanyId]);
  
  // Handle billable state when company changes
  useEffect(() => {
    if (!canBeBillable && isBillable) {
      form.setValue('is_billable', false);
    }
  }, [canBeBillable, isBillable, form]);

  // Clear related fields when company is deselected - memoized callback
  const clearRelatedFields = useCallback(() => {
    const currentValues = form.getValues();
    if (currentValues.campaign_id) {
      form.setValue('campaign_id', undefined);
    }
    if (currentValues.project_id) {
      form.setValue('project_id', undefined);
    }
    if (currentValues.task_id) {
      form.setValue('task_id', undefined);
    }
  }, [form]);

  // Handle company change
  useEffect(() => {
    if (!selectedCompanyId || selectedCompanyId === 'no-company') {
      clearRelatedFields();
    }
  }, [selectedCompanyId, clearRelatedFields]);
  
  // Handle mutual exclusivity between task, campaign, and project selections
  const handleTaskSelection = useCallback((value: string | null) => {
    form.setValue('task_id', value || undefined);
    if (value && value !== 'no-task') {
      form.setValue('campaign_id', undefined);
      form.setValue('project_id', undefined);
    }
  }, [form]);

  const handleCampaignSelection = useCallback((value: string | null) => {
    form.setValue('campaign_id', value || undefined);
    if (value && value !== 'no-campaign') {
      form.setValue('task_id', undefined);
      form.setValue('project_id', undefined);
    }
  }, [form]);

  const handleProjectSelection = useCallback((value: string | null) => {
    form.setValue('project_id', value || undefined);
    if (value && value !== 'no-project') {
      form.setValue('task_id', undefined);
      form.setValue('campaign_id', undefined);
    }
  }, [form]);

  // Prepare options for react-select
  const projectOptions = useMemo(() => [
    { value: 'no-project', label: 'No project' },
    ...companyProjects.map(project => ({ value: project.id, label: project.name }))
  ], [companyProjects]);

  const campaignOptions = useMemo(() => [
    { value: 'no-campaign', label: 'No campaign' },
    ...companyCampaigns.map(campaign => ({ value: campaign.id, label: campaign.name }))
  ], [companyCampaigns]);

  const taskOptions = useMemo(() => [
    { value: 'no-task', label: 'No related task' },
    ...companyTasks.map(task => ({ value: task.id, label: task.title }))
  ], [companyTasks]);

  // Custom styles for react-select to match shadcn/ui inputs
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '40px',
      height: '40px',
      border: `1px solid ${state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--border))'}`,
      borderRadius: '6px',
      backgroundColor: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
      fontSize: '14px',
      boxShadow: state.isFocused ? '0 0 0 2px hsl(var(--ring))' : 'none',
      '&:hover': {
        borderColor: 'hsl(var(--border))',
      },
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      height: '38px',
      padding: '0 12px',
    }),
    input: (provided: any) => ({
      ...provided,
      margin: '0px',
      color: 'hsl(var(--foreground))',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    indicatorsContainer: (provided: any) => ({
      ...provided,
      height: '38px',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: 'hsl(var(--popover))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '6px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'transparent',
      color: 'hsl(var(--foreground))',
      padding: '8px 12px',
      fontSize: '14px',
      '&:hover': {
        backgroundColor: 'hsl(var(--accent))',
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      fontSize: '14px',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
      fontSize: '14px',
    }),
  };

  // Create time entry mutation with enhanced data handling
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof timeEntrySchema>) => {
      if (!user) throw new Error('You must be logged in to create time entries');
      
      // Convert local datetime strings to proper ISO strings for database storage
      const startTime = new Date(values.start_time).toISOString();
      const endTime = new Date(values.end_time).toISOString();
      
      const timeEntryData = {
        description: values.description || null,
        start_time: startTime,
        end_time: endTime,
        task_id: values.task_id === 'no-task' ? null : values.task_id || null,
        user_id: user.id,
        is_billable: values.company_id && values.company_id !== 'no-company' ? values.is_billable : false,
        company_id: values.company_id === 'no-company' ? null : values.company_id || null,
        campaign_id: values.campaign_id === 'no-campaign' ? null : values.campaign_id || null,
        project_id: values.project_id === 'no-project' ? null : values.project_id || null,
      };
      
      const { data, error } = await supabase
        .from('time_entries')
        .insert(timeEntryData)
        .select('id');
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Time entry created',
        description: 'Your time entry has been created successfully.',
      });
      // Invalidate all time tracking related queries to refresh all views
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyHours'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      setIsCreating(false);
      onComplete();
      form.reset();
      setCurrentStep(1);
    },
    onError: (error) => {
      toast({
        title: 'Error creating time entry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update time entry mutation with enhanced data handling
  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof timeEntrySchema>) => {
      if (!currentEntry) return null;
      
      // Convert local datetime strings to proper ISO strings for database storage
      const startTime = new Date(values.start_time).toISOString();
      const endTime = new Date(values.end_time).toISOString();
      
      const timeEntryData = {
        description: values.description || null,
        start_time: startTime,
        end_time: endTime,
        task_id: values.task_id === 'no-task' ? null : values.task_id || null,
        is_billable: values.company_id && values.company_id !== 'no-company' ? values.is_billable : false,
        company_id: values.company_id === 'no-company' ? null : values.company_id || null,
        campaign_id: values.campaign_id === 'no-campaign' ? null : values.campaign_id || null,
        project_id: values.project_id === 'no-project' ? null : values.project_id || null,
      };
      
      const { data, error } = await supabase
        .from('time_entries')
        .update(timeEntryData)
        .eq('id', currentEntry.id)
        .select('id');
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Time entry updated',
        description: 'Your time entry has been updated successfully.',
      });
      // Invalidate all time tracking related queries to refresh all views
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyHours'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      setIsEditing(false);
      onCancelEdit();
      onComplete();
      form.reset();
      setCurrentStep(1);
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating time entry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle steps
  const goToNextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  }, []);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  // Submit handler for the form
  const onSubmit = useCallback((values: z.infer<typeof timeEntrySchema>) => {
    // If on first step and no company selected, directly submit (skip stage 2)
    if (currentStep === 1) {
      if (!values.company_id || values.company_id === 'no-company') {
        values.is_billable = false;
        values.campaign_id = undefined;
        values.task_id = undefined;
        values.project_id = undefined;
        
        if (isEditing && currentEntry) {
          updateMutation.mutate(values);
        } else {
          createMutation.mutate(values);
        }
        return;
      }
      
      goToNextStep();
      return;
    }
    
    // If on final step, submit form
    if (isEditing && currentEntry) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }, [currentStep, isEditing, currentEntry, updateMutation, createMutation, goToNextStep]);

  // Dialog content titles and descriptions
  const dialogTitle = isCompletingTracking 
    ? 'Complete Time Entry' 
    : isEditing 
    ? 'Edit Time Entry' 
    : 'Create Time Entry';
  
  const dialogDescription = isCompletingTracking
    ? 'Please provide additional details for your time entry.'
    : isEditing
    ? 'Update the details for your time entry.'
    : 'Add a manual time entry with specific start and end times.';

  // Step 1 content - Basic Details
  const renderStep1 = () => (
    <>
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
                <DateTimePicker field={field} label="Start Time" />
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
                <DateTimePicker field={field} label="End Time" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="company_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company (optional)</FormLabel>
            <FormControl>
              <CompanySelector
                companies={allCompanies}
                selectedCompanyId={field.value || null}
                onSelect={(companyId) => field.onChange(companyId)}
                isLoading={isLoadingCompanies}
              />
            </FormControl>
            <FormDescription>
              If no company is selected, the time entry will be non-billable
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  // Step 2 content - Additional Details
  const renderStep2 = () => (
    <>
      <FormField
        control={form.control}
        name="is_billable"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel>Billable</FormLabel>
              <FormDescription>
                Mark this time entry as billable 
                {!canBeBillable && 
                  <span className="text-destructive"> (requires a company)</span>
                }
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={!canBeBillable}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {!canBeBillable && isBillable && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            A company must be selected for billable entries.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground mb-2">
        Select only one of the following options:
      </div>

      <FormField
        control={form.control}
        name="project_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project</FormLabel>
            <FormControl>
              <ReactSelect
                options={projectOptions}
                value={projectOptions.find(option => option.value === field.value) || null}
                onChange={(selected) => handleProjectSelection(selected?.value || null)}
                isDisabled={!selectedCompanyId || selectedCompanyId === 'no-company' || isLoadingProjects || !!selectedTaskId || !!selectedCampaignId}
                placeholder={
                  !!selectedTaskId || !!selectedCampaignId 
                    ? "Clear other selections first"
                    : isLoadingProjects 
                      ? "Loading projects..." 
                      : "Select a project"
                }
                styles={customSelectStyles}
                isSearchable
                isClearable
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="campaign_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Campaign</FormLabel>
            <FormControl>
              <ReactSelect
                options={campaignOptions}
                value={campaignOptions.find(option => option.value === field.value) || null}
                onChange={(selected) => handleCampaignSelection(selected?.value || null)}
                isDisabled={!selectedCompanyId || selectedCompanyId === 'no-company' || isLoadingCampaigns || !!selectedTaskId || !!selectedProjectId}
                placeholder={
                  !!selectedTaskId || !!selectedProjectId 
                    ? "Clear other selections first"
                    : isLoadingCampaigns 
                      ? "Loading campaigns..." 
                      : "Select a campaign"
                }
                styles={customSelectStyles}
                isSearchable
                isClearable
              />
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
            <FormControl>
              <ReactSelect
                options={taskOptions}
                value={taskOptions.find(option => option.value === field.value) || null}
                onChange={(selected) => handleTaskSelection(selected?.value || null)}
                isDisabled={!selectedCompanyId || selectedCompanyId === 'no-company' || isLoadingTasks || !!selectedCampaignId || !!selectedProjectId}
                placeholder={
                  !!selectedCampaignId || !!selectedProjectId 
                    ? "Clear other selections first"
                    : isLoadingTasks 
                      ? "Loading tasks..." 
                      : "Link to a task"
                }
                styles={customSelectStyles}
                isSearchable
                isClearable
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  // Dialog content
  const dialogContent = (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogDescription>
          {currentStep === 1 ? 'Basic information' : 'Additional details'}
        </DialogDescription>
      </DialogHeader>
      
      <ProgressStepper 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}

          <DialogFooter className="flex justify-between pt-4 sm:justify-between">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline" onClick={() => {
                  onCancelEdit();
                  setCurrentStep(1);
                }}>
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={
                  createMutation.isPending || 
                  updateMutation.isPending || 
                  (currentStep === 2 && isBillable && !canBeBillable)
                }
                className="flex items-center gap-1"
              >
                {createMutation.isPending || updateMutation.isPending 
                  ? 'Saving...' 
                  : currentStep === 1
                    ? selectedCompanyId && selectedCompanyId !== 'no-company'
                      ? (
                        <>
                          Next <ArrowRight className="h-4 w-4" />
                        </>
                      )
                      : "Save"
                    : isEditing 
                      ? 'Save Changes' 
                      : 'Create Entry'
                }
              </Button>
            </div>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );

  // Dialog for creating a new time entry
  if (isCreating) {
    return (
      <Dialog open={isCreating} onOpenChange={(open) => {
        setIsCreating(open);
        if (!open) setCurrentStep(1);
      }}>
        {dialogContent}
      </Dialog>
    );
  }

  // Dialog for editing an existing time entry
  if (isEditing) {
    return (
      <Dialog open={isEditing} onOpenChange={(open) => {
        setIsEditing(open);
        if (!open) setCurrentStep(1);
      }}>
        {dialogContent}
      </Dialog>
    );
  }

  return null;
};
