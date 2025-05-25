
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
import { CreationMethodStage } from './MultiStageCompanyDialog/CreationMethodStage';
import { BrunnøysundSearchStage } from './MultiStageCompanyDialog/BrunnøysundSearchStage';
import type { CreationMethod, BrregCompany } from './MultiStageCompanyDialog/types';

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
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 for method selection
  const [creationMethod, setCreationMethod] = useState<CreationMethod | null>(null);
  const [selectedBrregCompany, setSelectedBrregCompany] = useState<BrregCompany | null>(null);
  const totalSteps = 4; // Method selection + Search/Basic info + Website + Complete
  
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

  // Prefill form when Brunnøysund company is selected
  useEffect(() => {
    if (selectedBrregCompany) {
      form.setValue('name', selectedBrregCompany.navn);
      form.setValue('organization_number', selectedBrregCompany.organisasjonsnummer);
    }
  }, [selectedBrregCompany, form]);
  
  // Handle steps navigation
  const goToNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleMethodSelect = (method: CreationMethod) => {
    setCreationMethod(method);
    if (method === 'manual') {
      setCurrentStep(2); // Go to basic info stage for manual creation
    } else {
      setCurrentStep(1); // Go to search stage for Brunnøysund
    }
  };

  const handleBrregCompanySelect = (company: BrregCompany) => {
    setSelectedBrregCompany(company);
    setCurrentStep(3); // Go to website stage
  };

  const getStageTitle = () => {
    if (currentStep === 0) return 'Creation Method';
    if (currentStep === 1) return 'Search Company Registry';
    if (currentStep === 2) return 'Basic Information';
    if (currentStep === 3) return 'Website Information';
    return 'Create Subsidiary';
  };
  
  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: (values: CompanyFormValues) => {
      // Create a company object with copied values from parent
      const companyData = {
        name: values.name,
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
      setCurrentStep(0);
      setCreationMethod(null);
      setSelectedBrregCompany(null);
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
    createCompanyMutation.mutate(values);
  };

  const handleNext = () => {
    if (currentStep === 2 && creationMethod === 'manual') {
      // Go to website stage after basic info for manual creation
      setCurrentStep(3);
    } else if (currentStep < totalSteps - 1) {
      goToNextStep();
    }
  };

  const handleBack = () => {
    if (currentStep === 3 && creationMethod === 'brunnøysund') {
      setCurrentStep(1); // Go back to search
    } else if (currentStep === 3 && creationMethod === 'manual') {
      setCurrentStep(2); // Go back to basic info
    } else if (currentStep === 2 && creationMethod === 'manual') {
      setCurrentStep(0); // Go back to method selection
    } else if (currentStep > 0) {
      setCurrentStep(0); // Go back to method selection
    }
  };

  // Validate current step before allowing next
  const canProceedToNext = () => {
    if (currentStep === 2 && creationMethod === 'manual') {
      // For manual basic info step, require name
      return form.watch('name')?.trim().length > 0;
    }
    return true;
  };
  
  // Render method selection step (step 0)
  const renderMethodSelectionStep = () => (
    <CreationMethodStage onSelect={handleMethodSelect} />
  );

  // Render search step (step 1)
  const renderSearchStep = () => (
    <BrunnøysundSearchStage onCompanySelect={handleBrregCompanySelect} />
  );

  // Render basic info step (step 2) - for manual creation
  const renderBasicInfoStep = () => (
    <>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="organization_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter organization number (optional)" {...field} />
              </FormControl>
              <FormDescription>
                Optional organization number for the subsidiary
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
  
  // Render website step (step 3)
  const renderWebsiteStep = () => (
    <>
      <div className="flex items-start gap-4 mb-4">
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
          <div className="text-lg font-semibold">{form.watch('name')}</div>
          {form.watch('organization_number') && (
            <div className="text-sm text-gray-600">
              Org. nr: {form.watch('organization_number')}
            </div>
          )}
        </div>
      </div>

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

  const renderStageContent = () => {
    if (currentStep === 0) {
      return renderMethodSelectionStep();
    }
    if (currentStep === 1) {
      return renderSearchStep();
    }
    if (currentStep === 2) {
      return renderBasicInfoStep();
    }
    if (currentStep === 3) {
      return renderWebsiteStep();
    }
    return null;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setCurrentStep(0);
        setCreationMethod(null);
        setSelectedBrregCompany(null);
        setLogo(null);
        form.reset();
      }
      onClose();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Subsidiary</DialogTitle>
          <DialogDescription>
            {getStageTitle()}
          </DialogDescription>
        </DialogHeader>
        
        {currentStep > 0 && <ProgressStepper currentStep={currentStep} totalSteps={totalSteps} />}
        
        <Form {...form}>
          {/* Remove onSubmit from form tag to prevent automatic submission */}
          <div className="space-y-4">
            {renderStageContent()}
            
            {currentStep > 0 && (
              <DialogFooter className="flex justify-between pt-4 sm:justify-between">
                <div>
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                  {currentStep === 3 ? (
                    <Button 
                      type="button"
                      onClick={() => form.handleSubmit(onSubmit)()}
                      className="flex items-center gap-1"
                      disabled={createCompanyMutation.isPending}
                    >
                      {createCompanyMutation.isPending 
                        ? 'Creating...' 
                        : 'Create Subsidiary'
                      }
                    </Button>
                  ) : (
                    currentStep >= 2 && (
                      <Button 
                        type="button"
                        onClick={handleNext}
                        className="flex items-center gap-1"
                        disabled={!canProceedToNext()}
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </Button>
                    )
                  )}
                </div>
              </DialogFooter>
            )}
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
