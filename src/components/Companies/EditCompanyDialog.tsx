
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProgressStepper } from '@/components/ui/progress-stepper';
import { cn } from '@/lib/utils';

// Form schema
const companyFormSchema = z.object({
  name: z.string().min(1, { message: 'Company name is required' }),
  website: z.string().url().or(z.literal('')).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo_url: z.string().url().or(z.literal('')).optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

type EditCompanyDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
};

export const EditCompanyDialog = ({
  isOpen,
  onClose,
  companyId,
}: EditCompanyDialogProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '',
      website: '',
      phone: '',
      address: '',
      logo_url: '',
    },
  });
  
  // Fetch company data - use fetchCompanyById instead of getCompany
  const { data: company, isLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companyService.fetchCompanyById(companyId),
    enabled: isOpen && !!companyId,
  });
  
  // Update form when company data loads
  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name,
        website: company.website || '',
        phone: company.phone || '',
        address: company.address || '',
        logo_url: company.logo_url || '',
      });
    }
  }, [company, form]);
  
  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: (values: CompanyFormValues) => companyService.updateCompany(companyId, values),
    onSuccess: () => {
      toast({
        title: 'Company updated',
        description: 'The company has been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['company', companyId] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['childCompanies'] });
      setCurrentStep(1); // Reset step
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update company: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const goToNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const onSubmit = (values: CompanyFormValues) => {
    if (currentStep < totalSteps) {
      goToNextStep();
      return;
    }
    updateCompanyMutation.mutate(values);
  };
  
  // Render basic info step (step 1)
  const renderBasicInfoStep = () => (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="website"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
  
  // Render contact details step (step 2)
  const renderContactDetailsStep = () => (
    <>
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="logo_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Logo URL</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>
              Direct URL to company logo image
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>
            Step {currentStep} of {totalSteps}: {
              currentStep === 1 ? 'Basic Information' : 'Contact Details'
            }
          </DialogDescription>
        </DialogHeader>
        
        <ProgressStepper currentStep={currentStep} totalSteps={totalSteps} />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {currentStep === 1 && renderBasicInfoStep()}
            {currentStep === 2 && renderContactDetailsStep()}
            
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
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button 
                  type="submit" 
                  className="flex items-center gap-1"
                  disabled={updateCompanyMutation.isPending}
                >
                  {updateCompanyMutation.isPending 
                    ? 'Saving...' 
                    : currentStep === totalSteps 
                      ? 'Save Changes' 
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
};
