
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
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
import { ProgressStepper } from '@/components/ui/progress-stepper';
import { ChevronLeft, ChevronRight, Globe, Building } from 'lucide-react';
import type { Company } from '@/types/company';

// Form schema - simplified for subsidiaries
const companyFormSchema = z.object({
  name: z.string().min(1, { message: 'Company name is required' }),
  organization_number: z.string().optional(),
  website: z.string().url().or(z.literal('')).optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

type CreateCompanyDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string;
  parentCompany?: Company;
};

export const CreateCompanyDialog = ({
  isOpen,
  onClose,
  parentId,
  parentCompany,
}: CreateCompanyDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logo, setLogo] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '',
      organization_number: '',
      website: '',
    },
  });
  
  // Watch for website changes to fetch favicon
  const website = form.watch('website');
  
  useEffect(() => {
    if (website) {
      const fetchLogo = async () => {
        try {
          const faviconUrl = await companyService.fetchFavicon(website);
          if (faviconUrl) {
            setLogo(faviconUrl);
          }
        } catch (error) {
          console.error('Failed to fetch favicon:', error);
        }
      };
      
      fetchLogo();
    }
  }, [website]);
  
  // Handle steps navigation
  const goToNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: (values: CompanyFormValues) => {
      // Create a company object with copied values from parent
      const companyData = {
        name: values.name, // Make sure name is explicitly included
        organization_number: values.organization_number,
        website: values.website,
        parent_id: parentId,
        logo_url: logo,
        // Copy values from parent company
        phone: parentCompany?.phone,
        address: parentCompany?.address,
        street_address: parentCompany?.street_address,
        city: parentCompany?.city,
        postal_code: parentCompany?.postal_code,
        country: parentCompany?.country,
        invoice_email: parentCompany?.invoice_email,
        advisor_id: parentCompany?.advisor_id,
        // For subsidiaries, we'll default to the same client types as the parent
        is_marketing_client: parentCompany?.is_marketing_client,
        is_web_client: parentCompany?.is_web_client,
        // No MRR for subsidiaries
        mrr: 0,
      };
      
      return companyService.createCompany(companyData);
    },
    onSuccess: () => {
      toast({
        title: 'Subsidiary created',
        description: 'The subsidiary has been created successfully',
      });
      if (parentId) {
        queryClient.invalidateQueries({ queryKey: ['childCompanies', parentId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['companies'] });
      }
      form.reset();
      setLogo(null);
      setCurrentStep(1);
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create subsidiary: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const onSubmit = (values: CompanyFormValues) => {
    if (currentStep < totalSteps) {
      goToNextStep();
      return;
    }
    createCompanyMutation.mutate(values);
  };
  
  // Render basic info step (step 1)
  const renderBasicInfoStep = () => (
    <>
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
          {logo ? (
            <img 
              src={logo} 
              alt="Company Logo" 
              className="h-12 w-12 object-contain"
            />
          ) : (
            <Building className="h-8 w-8 text-gray-400" />
          )}
        </div>
        <div className="flex-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name*</FormLabel>
                <FormControl>
                  <Input placeholder="Subsidiary Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      
      <FormField
        control={form.control}
        name="organization_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Organization Number</FormLabel>
            <FormControl>
              <Input placeholder="123456-7890" {...field} />
            </FormControl>
            <FormDescription>
              Official registration number of the subsidiary
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
  
  // Render website step (step 2)
  const renderWebsiteStep = () => (
    <>
      <FormField
        control={form.control}
        name="website"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> Website
            </FormLabel>
            <FormControl>
              <Input placeholder="https://subsidiary.example.com" {...field} />
            </FormControl>
            <FormDescription>
              Company website (logo will be automatically fetched)
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
          <DialogTitle>Add Subsidiary</DialogTitle>
          <DialogDescription>
            Step {currentStep} of {totalSteps}: {
              currentStep === 1 ? 'Basic Information' : 'Website'
            }
          </DialogDescription>
        </DialogHeader>
        
        <ProgressStepper currentStep={currentStep} totalSteps={totalSteps} />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {currentStep === 1 && renderBasicInfoStep()}
            {currentStep === 2 && renderWebsiteStep()}
            
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
                  disabled={createCompanyMutation.isPending}
                >
                  {createCompanyMutation.isPending 
                    ? 'Creating...' 
                    : currentStep === totalSteps 
                      ? 'Create Subsidiary' 
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
