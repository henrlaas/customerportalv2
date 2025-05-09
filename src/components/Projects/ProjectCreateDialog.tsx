
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyNames } from '@/hooks/useCompanyNames';
import { PriceType } from '@/types/project';
import { useUserFetch } from '@/hooks/useUserFetch';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { useToast } from '@/hooks/use-toast';
import {
  Step,
  useMultiStepForm,
} from '@/components/ui/multi-step-form';

const projectFormSchema = z.object({
  company_id: z.string().min(1, 'Company is required'),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  value: z.string().optional().transform(val => val ? Number(val) : null),
  price_type: z.enum(['fixed', 'estimated']).optional().nullable(),
  deadline: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export interface ProjectCreateDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProjectFormValues, assigneeIds: string[]) => void;
}

export const ProjectCreateDialog = ({ 
  isOpen, 
  onOpenChange,
  onSubmit 
}: ProjectCreateDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const companyNamesQuery = useCompanyNames();
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const { users } = useUserFetch();

  const companyOptions = companyNamesQuery.data?.map(company => ({
    value: company.id,
    label: company.name
  })) || [];

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      value: '',
      price_type: null,
      deadline: '',
    },
  });

  const steps: Step[] = [
    { id: 'basic-info', label: 'Basic Info' },
    { id: 'details', label: 'Project Details' },
    { id: 'assignees', label: 'Assignees' },
  ];

  const { currentStepIndex, step, isFirstStep, isLastStep, nextStep, prevStep } = useMultiStepForm(steps);

  const handleSubmit = (values: ProjectFormValues) => {
    if (!isLastStep) {
      nextStep();
      return;
    }
    
    // Format deadline date properly if it exists
    const formattedValues = {
      ...values,
      deadline: values.deadline ? new Date(values.deadline).toISOString() : null,
      created_by: user?.id,
    };

    onSubmit(formattedValues, selectedAssignees);
    form.reset();
    setSelectedAssignees([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {step.id === 'basic-info' && (
              <>
                <FormField
                  control={form.control}
                  name="company_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companyOptions.map((company) => (
                            <SelectItem key={company.value} value={company.value}>
                              {company.label}
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the project scope and goals..." 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step.id === 'details' && (
              <>
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
                        />
                      </FormControl>
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
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select price type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Price</SelectItem>
                          <SelectItem value="estimated">Estimated Price</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step.id === 'assignees' && (
              <div className="space-y-4">
                <h3 className="font-medium">Assign team members to this project</h3>
                <div className="grid grid-cols-1 gap-2">
                  {users?.map(user => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={selectedAssignees.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAssignees([...selectedAssignees, user.id]);
                          } else {
                            setSelectedAssignees(
                              selectedAssignees.filter(id => id !== user.id)
                            );
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <label htmlFor={`user-${user.id}`} className="text-sm">
                        {user.first_name} {user.last_name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {!isFirstStep && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                >
                  Back
                </Button>
              )}
              <div className="flex-grow"></div>
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
