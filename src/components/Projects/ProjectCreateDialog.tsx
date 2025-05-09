
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMultiStepForm } from '@/components/ui/multi-step-form';
import { useCompanyNames } from '@/hooks/useCompanyNames';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/company';
import { MultiSelect } from '@/components/ui/multi-select';

interface ProjectCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ProjectFormValues, assigneeIds: string[]) => void;
}

// Define schema for the project form
const projectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  company_id: z.string({
    required_error: 'Please select a company',
  }),
  value: z.coerce.number().optional(),
  price_type: z.enum(['fixed', 'estimated']).optional(),
  deadline: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const ProjectCreateDialog = ({
  isOpen,
  onOpenChange,
  onSubmit,
}: ProjectCreateDialogProps) => {
  const { user } = useAuth();
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  
  // Initialize form with default values
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      value: undefined,
      price_type: 'estimated',
    },
  });

  // Fetch companies for dropdown
  const { data: companies = [], isLoading: isLoadingCompanies } = useCompanyNames();
  
  // Fetch users for assignee selection
  const { data: profiles = [], isLoading: isLoadingProfiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('first_name');
        
      if (error) throw error;
      
      return data as Profile[];
    }
  });
  
  // Setup multi-step form
  const {
    step,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    goToStep,
  } = useMultiStepForm([
    {
      id: 'project-details',
      label: 'Project Details',
    },
    {
      id: 'team-assignments',
      label: 'Team & Deadlines',
    },
  ]);

  // Handle form submission
  const handleSubmit = (values: ProjectFormValues) => {
    if (!isLastStep) {
      return nextStep();
    }
    
    if (user) {
      // Add created_by field
      const projectData = {
        ...values,
        created_by: user.id,
      };
      
      onSubmit(projectData, assigneeIds);
      form.reset();
      setAssigneeIds([]);
      onOpenChange(false);
    }
  };

  // Format display name for profiles
  const formatProfileName = (profile: Profile) => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile.first_name) return profile.first_name;
    return `User ${profile.id.substring(0, 8)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            {step.id === 'project-details' && 'Enter the basic details for this project.'}
            {step.id === 'team-assignments' && 'Assign team members and set the deadline.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {step.id === 'project-details' && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Website Redesign" {...field} />
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
                      <FormLabel>Associated Company</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoadingCompanies}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the project scope, goals, and deliverables..." 
                          rows={4}
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Value (NOK)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="50000" 
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormDescription>
                        The total budget or value for this project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Type</FormLabel>
                      <FormControl>
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          defaultValue={field.value} 
                          className="flex gap-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="fixed" />
                            </FormControl>
                            <FormLabel className="font-normal">Fixed Price</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="estimated" />
                            </FormControl>
                            <FormLabel className="font-normal">Estimated Price</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step.id === 'team-assignments' && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium leading-none">
                      Assignees
                    </label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Select team members who will work on this project
                    </p>
                    <MultiSelect 
                      options={profiles.map(profile => ({
                        value: profile.id,
                        label: formatProfileName(profile)
                      }))}
                      selected={assigneeIds}
                      onChange={setAssigneeIds}
                      placeholder="Select team members"
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadline (Optional)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormDescription>
                          The date by which the project should be completed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  if (isFirstStep) {
                    onOpenChange(false);
                    form.reset();
                  } else {
                    prevStep();
                  }
                }}
              >
                {isFirstStep ? 'Cancel' : 'Back'}
              </Button>
              <Button type="submit">
                {isLastStep ? 'Create Project' : 'Next'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
