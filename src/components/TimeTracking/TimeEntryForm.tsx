import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
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

// Time entry form schema
const timeEntrySchema = z.object({
  description: z.string().optional(),
  start_time: z.string().min(1, { message: 'Start time is required' }),
  end_time: z.string().optional(),
  task_id: z.string().optional(),
  is_billable: z.boolean().default(false),
  company_id: z.string().optional(),
  campaign_id: z.string().optional(),
  project_id: z.string().optional(),
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
  
  // Format dates properly for input fields
  const formatDateForInput = useCallback((dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().substring(0, 16);
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
  const handleTaskSelection = useCallback((value: string) => {
    form.setValue('task_id', value);
    if (value && value !== 'no-task') {
      form.setValue('campaign_id', undefined);
      form.setValue('project_id', undefined);
    }
  }, [form]);

  const handleCampaignSelection = useCallback((value: string) => {
    form.setValue('campaign_id', value);
    if (value && value !== 'no-campaign') {
      form.setValue('task_id', undefined);
      form.setValue('project_id', undefined);
    }
  }, [form]);

  const handleProjectSelection = useCallback((value: string) => {
    form.setValue('project_id', value);
    if (value && value !== 'no-project') {
      form.setValue('task_id', undefined);
      form.setValue('campaign_id', undefined);
    }
  }, [form]);

  // Create time entry mutation
  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof timeEntrySchema>) => {
      if (!user) throw new Error('You must be logged in to create time entries');
      
      const timeEntryData = {
        description: values.description || null,
        start_time: values.start_time,
        end_time: values.end_time || null,
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
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyHours'] });
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

  // Update time entry mutation
  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof timeEntrySchema>) => {
      if (!currentEntry) return null;
      
      const timeEntryData = {
        description: values.description || null,
        start_time: values.start_time,
        end_time: values.end_time || null,
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
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyHours'] });
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
        name="company_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company (optional)</FormLabel>
            <FormControl>
              <CompanySelector
                companies={allCompanies}
                selectedCompanyId={field.value || null}
                onSelect={(companyId) => field.onChange(companyId)}
                showSubsidiaries={showSubsidiaries}
                onToggleSubsidiaries={setShowSubsidiaries}
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
            <Select
              onValueChange={handleProjectSelection}
              value={field.value}
              disabled={!selectedCompanyId || selectedCompanyId === 'no-company' || isLoadingProjects || !!selectedTaskId || !!selectedCampaignId}
            >
              <FormControl>
                <SelectTrigger className={!!selectedTaskId || !!selectedCampaignId ? 'opacity-50' : ''}>
                  <SelectValue placeholder={
                    !!selectedTaskId || !!selectedCampaignId 
                      ? "Clear other selections first"
                      : isLoadingProjects 
                        ? "Loading projects..." 
                        : "Select a project"
                  } />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="no-project">No project</SelectItem>
                {companyProjects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select
              onValueChange={handleCampaignSelection}
              value={field.value}
              disabled={!selectedCompanyId || selectedCompanyId === 'no-company' || isLoadingCampaigns || !!selectedTaskId || !!selectedProjectId}
            >
              <FormControl>
                <SelectTrigger className={!!selectedTaskId || !!selectedProjectId ? 'opacity-50' : ''}>
                  <SelectValue placeholder={
                    !!selectedTaskId || !!selectedProjectId 
                      ? "Clear other selections first"
                      : isLoadingCampaigns 
                        ? "Loading campaigns..." 
                        : "Select a campaign"
                  } />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="no-campaign">No campaign</SelectItem>
                {companyCampaigns.map(campaign => (
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

      <FormField
        control={form.control}
        name="task_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Related Task</FormLabel>
            <Select
              onValueChange={handleTaskSelection}
              value={field.value}
              disabled={!selectedCompanyId || selectedCompanyId === 'no-company' || isLoadingTasks || !!selectedCampaignId || !!selectedProjectId}
            >
              <FormControl>
                <SelectTrigger className={!!selectedCampaignId || !!selectedProjectId ? 'opacity-50' : ''}>
                  <SelectValue placeholder={
                    !!selectedCampaignId || !!selectedProjectId 
                      ? "Clear other selections first"
                      : isLoadingTasks 
                        ? "Loading tasks..." 
                        : "Link to a task"
                  } />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="no-task">No related task</SelectItem>
                {companyTasks.map(task => (
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
