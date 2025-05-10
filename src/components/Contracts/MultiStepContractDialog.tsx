
import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProgressStepper } from '@/components/ui/progress-stepper';

// Schema for the contract form
const contractFormSchema = z.object({
  title: z.string().min(1, { message: 'Contract title is required' }),
  company_id: z.string().min(1, { message: 'Company is required' }),
  status: z.string().default('draft'),
  content: z.string().min(1, { message: 'Contract content is required' }),
  notes: z.string().optional(),
});

type ContractFormValues = z.infer<typeof contractFormSchema>;

interface MultiStepContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MultiStepContractDialog({ isOpen, onClose }: MultiStepContractDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      title: '',
      company_id: '',
      status: 'draft',
      content: '',
      notes: '',
    },
  });

  // Fetch companies for dropdown
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('companies').select('id, name').order('name');
      if (error) throw error;
      return data;
    },
  });

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (values: ContractFormValues) => {
      if (!user) throw new Error("You must be logged in to create a contract");
      
      const { data, error } = await supabase
        .from('contracts')
        .insert([
          {
            title: values.title,
            company_id: values.company_id,
            status: values.status,
            content: values.content,
            notes: values.notes || null,
            created_by: user.id,
          }
        ])
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Contract created',
        description: 'The contract has been created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      form.reset();
      setCurrentStep(1);
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create contract: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle step navigation
  const goToNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit handler
  const onSubmit = (values: ContractFormValues) => {
    if (currentStep < totalSteps) {
      goToNextStep();
    } else {
      createContractMutation.mutate(values);
    }
  };

  // Step 1: Basic information
  const renderBasicInfoStep = () => (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contract Title</FormLabel>
            <FormControl>
              <Input placeholder="Marketing Agreement" {...field} />
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
            <Select onValueChange={field.onChange} defaultValue={field.value}>
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
    </>
  );

  // Step 2: Contract content
  const renderContentStep = () => (
    <>
      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contract Content</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter contract details here..." 
                className="min-h-[200px]" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  // Step 3: Additional details
  const renderDetailsStep = () => (
    <>
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="signed">Signed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Initial status of the contract
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Any additional notes..." 
                className="min-h-[100px]" 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Internal notes about this contract
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setCurrentStep(1); // Reset to first step when closing
      }
      onClose();
    }}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create Contract</DialogTitle>
          <DialogDescription>
            Step {currentStep} of {totalSteps}: {
              currentStep === 1 ? 'Basic Information' : 
              currentStep === 2 ? 'Contract Content' : 
              'Additional Details'
            }
          </DialogDescription>
        </DialogHeader>

        <ProgressStepper currentStep={currentStep} totalSteps={totalSteps} />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {currentStep === 1 && renderBasicInfoStep()}
            {currentStep === 2 && renderContentStep()}
            {currentStep === 3 && renderDetailsStep()}
            
            <DialogFooter className="flex justify-between pt-4 sm:justify-between">
              <div>
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousStep}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="flex items-center gap-1"
                  disabled={createContractMutation.isPending}
                >
                  {createContractMutation.isPending 
                    ? 'Creating...' 
                    : currentStep === totalSteps 
                      ? 'Create Contract' 
                      : (
                        <>
                          Next <ChevronRight className="h-4 w-4" />
                        </>
                      )
                  }
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
