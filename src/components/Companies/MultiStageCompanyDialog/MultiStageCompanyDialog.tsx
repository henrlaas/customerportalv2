

// ----- Imports
import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/companyService';
import { userService } from '@/services/userService';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
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
import { cn } from '@/lib/utils';
import { companyFormSchema, CompanyFormValues, MultiStageCompanyDialogProps, CreationMethod, BrregCompany } from './types';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressStepper } from '@/components/ui/progress-stepper';
// Newly added componentized stages and constants
import { CreationMethodStage } from './CreationMethodStage';
import { BrunnøysundSearchStage } from './BrunnøysundSearchStage';
import { BasicInfoStage } from './BasicInfoStage';
import { ContactDetailsStage } from './ContactDetailsStage';
import { AddressAndSettingsStage } from './AddressAndSettingsStage';
import { CLIENT_TYPES } from './ClientTypes';

export function MultiStageCompanyDialog({
  isOpen,
  onClose,
  parentId,
  defaultValues,
  dealId,
}: MultiStageCompanyDialogProps) {
  const [stage, setStage] = useState(0); // Start at 0 for method selection
  const [logo, setLogo] = useState<string | null>(null);
  const [creationMethod, setCreationMethod] = useState<CreationMethod | null>(null);
  const [selectedBrregCompany, setSelectedBrregCompany] = useState<BrregCompany | null>(null);
  const [isFormReady, setIsFormReady] = useState(false);
  const hasInitialized = useRef(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const totalStages = 5; // Method selection + 4 original stages (basic info, contact, address/settings)

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.listUsers(),
  });

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '',
      organization_number: '',
      client_types: [CLIENT_TYPES.MARKETING],
      website: '',
      phone: '',
      invoice_email: '',
      street_address: '',
      city: '',
      postal_code: '',
      country: '', // Remove default "Norge"
      parent_id: parentId || '',
      trial_period: false,
      is_partner: false,
      advisor_id: user?.id || '',
      mrr: 0, // Default to 0 instead of undefined
      ...defaultValues,
    },
  });

  // Initialize stage and method when defaultValues are provided (conversion scenario)
  useEffect(() => {
    console.log('MultiStageCompanyDialog: Initializing with defaultValues:', defaultValues);
    if (defaultValues && Object.keys(defaultValues).length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      setIsFormReady(false); // Mark form as not ready
      
      // This is a conversion scenario, skip to basic info stage
      console.log('MultiStageCompanyDialog: Setting stage to 2 for conversion');
      setStage(2);
      setCreationMethod('manual');
      
      // Reset form with default values to ensure they're properly applied
      const resetData = {
        name: '',
        organization_number: '',
        client_types: [CLIENT_TYPES.MARKETING],
        website: '',
        phone: '',
        invoice_email: '',
        street_address: '',
        city: '',
        postal_code: '',
        country: '',
        parent_id: parentId || '',
        trial_period: false,
        is_partner: false,
        advisor_id: user?.id || '',
        mrr: 0,
        ...defaultValues,
      };
      console.log('MultiStageCompanyDialog: Resetting form with data:', resetData);
      
      // Reset form and clear all errors
      form.reset(resetData, {
        keepErrors: false,
        keepDirty: false,
        keepDirtyValues: false,
        keepValues: false,
        keepDefaultValues: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false,
      });
      
      // Use setTimeout to ensure form reset completes
      setTimeout(() => {
        setIsFormReady(true); // Mark form as ready after reset
      }, 100);
    } else if (!defaultValues || Object.keys(defaultValues).length === 0) {
      // Normal creation, start at method selection
      console.log('MultiStageCompanyDialog: Setting stage to 0 for normal creation');
      setStage(0);
      setCreationMethod(null);
      setIsFormReady(true); // Form is ready for normal creation
    }
  }, [defaultValues, parentId, user?.id, form]);

  const website = form.watch('website');
  const clientTypes = form.watch('client_types');
  const hasMarketingType = clientTypes?.includes(CLIENT_TYPES.MARKETING);

  // Add stage-specific validation logic
  const validateCurrentStage = async (): Promise<boolean> => {
    console.log('MultiStageCompanyDialog: Validating stage', stage);
    console.log('MultiStageCompanyDialog: Current form values before validation:', form.getValues());
    console.log('MultiStageCompanyDialog: Form state errors before validation:', form.formState.errors);
    
    // Clear any existing errors first
    form.clearErrors();
    
    let fieldsToValidate: (keyof CompanyFormValues)[] = [];
    
    switch (stage) {
      case 2: // Basic Info stage
        fieldsToValidate = ['name', 'client_types'];
        // Only validate organization_number if it has a value
        const orgNumber = form.getValues('organization_number');
        if (orgNumber && orgNumber.trim() !== '') {
          fieldsToValidate.push('organization_number');
        }
        break;
      case 3: // Contact Details stage
        fieldsToValidate = ['website', 'phone', 'invoice_email'];
        break;
      case 4: // Address & Settings stage
        fieldsToValidate = [
          'street_address', 
          'city', 
          'postal_code', 
          'advisor_id'
        ];
        
        // Only validate MRR if Marketing client type is selected
        if (hasMarketingType) {
          fieldsToValidate.push('mrr');
        }
        
        // Country is optional, trial_period and is_partner have defaults
        break;
      default:
        console.log('MultiStageCompanyDialog: No validation needed for stage', stage);
        return true; // No validation for stage 0 and 1 (method selection and search)
    }
    
    console.log('MultiStageCompanyDialog: Fields to validate:', fieldsToValidate);
    
    // Get current values for the fields we're validating
    const currentValues = form.getValues();
    const valuesToValidate = fieldsToValidate.reduce((acc, field) => {
      acc[field] = currentValues[field];
      return acc;
    }, {} as any);
    console.log('MultiStageCompanyDialog: Values to validate:', valuesToValidate);
    
    // Manually trigger validation with a small delay to ensure form state is ready
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const result = await form.trigger(fieldsToValidate as any);
    console.log('MultiStageCompanyDialog: Validation result:', result);
    
    if (!result) {
      console.log('MultiStageCompanyDialog: Validation failed with errors:', form.formState.errors);
      // Log specific field errors
      fieldsToValidate.forEach(field => {
        if (form.formState.errors[field]) {
          console.log(`MultiStageCompanyDialog: Error in field ${field}:`, form.formState.errors[field]);
        }
      });
    } else {
      console.log('MultiStageCompanyDialog: Validation passed for stage', stage);
    }
    
    return result;
  };

  // Add a new handleNext function
  const handleNext = async () => {
    console.log('MultiStageCompanyDialog: handleNext called at stage', stage);
    console.log('MultiStageCompanyDialog: Form is valid:', form.formState.isValid);
    console.log('MultiStageCompanyDialog: Form has errors:', Object.keys(form.formState.errors).length > 0);
    
    // For stages that need validation (2, 3, 4)
    if (stage >= 2) {
      console.log('MultiStageCompanyDialog: Stage requires validation, checking...');
      const isValid = await validateCurrentStage();
      
      if (!isValid) {
        console.log('MultiStageCompanyDialog: Validation failed, not proceeding to next stage');
        return;
      }
      console.log('MultiStageCompanyDialog: Validation passed, proceeding');
    }
    
    // If we're on the last stage, submit the form
    if (stage === totalStages - 1) {
      console.log('MultiStageCompanyDialog: Final stage, submitting form');
      // Final validation of all fields before submission
      const isFormValid = await form.trigger();
      if (isFormValid) {
        const values = form.getValues();
        console.log('MultiStageCompanyDialog: Submitting with values:', values);
        createCompanyMutation.mutate(values);
      } else {
        console.log('MultiStageCompanyDialog: Final validation failed, not submitting');
      }
    } else {
      // Otherwise just go to next stage
      console.log('MultiStageCompanyDialog: Moving to next stage:', stage + 1);
      setStage(stage + 1);
    }
  };

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
      const address = selectedBrregCompany.forretningsadresse;
      form.setValue('name', selectedBrregCompany.navn);
      form.setValue('organization_number', selectedBrregCompany.organisasjonsnummer);
      
      if (address) {
        if (address.land) form.setValue('country', address.land);
        if (address.postnummer) form.setValue('postal_code', address.postnummer);
        if (address.poststed) form.setValue('city', address.poststed);
        if (address.adresse) form.setValue('street_address', address.adresse.join(', '));
      }
    }
  }, [selectedBrregCompany, form]);

  const createCompanyMutation = useMutation({
    mutationFn: async (values: CompanyFormValues) => {
      const companyData = {
        ...values,
        logo_url: logo,
        parent_id: values.parent_id || null,
        client_types: values.client_types,
        mrr: hasMarketingType ? values.mrr : null,
        name: values.name,
        country: values.country || null,
      };
      if (dealId) {
        return await companyService.convertTempCompany(companyData, dealId);
      }
      return await companyService.createCompany(companyData);
    },
    onSuccess: () => {
      toast({
        title: 'Company created',
        description: 'The company has been created successfully',
      });
      if (dealId) {
        queryClient.invalidateQueries({ queryKey: ['deals'] });
        queryClient.invalidateQueries({ queryKey: ['temp-deal-companies'] });
      }
      if (parentId) {
        queryClient.invalidateQueries({ queryKey: ['childCompanies', parentId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['companies'] });
      }
      form.reset();
      setStage(0);
      setCreationMethod(null);
      setSelectedBrregCompany(null);
      setLogo(null);
      hasInitialized.current = false; // Reset initialization flag
      setIsFormReady(false);
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create company: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const goBack = () => {
    if (stage > 0) {
      setStage(stage - 1);
    }
  };

  const handleMethodSelect = (method: CreationMethod) => {
    setCreationMethod(method);
    if (method === 'manual') {
      setStage(2); // Skip search stage, go directly to basic info
    } else {
      setStage(1); // Go to search stage
    }
  };

  const handleBrregCompanySelect = (company: BrregCompany) => {
    setSelectedBrregCompany(company);
    setStage(2); // Go to basic info stage
  };

  const handleClose = () => {
    hasInitialized.current = false; // Reset initialization flag when dialog closes
    setIsFormReady(false);
    setStage(0);
    setCreationMethod(null);
    form.reset(); // Reset form to initial state
    onClose();
  };

  const getStageTitle = () => {
    if (stage === 0) return 'Creation Method';
    if (stage === 1) return 'Search Company Registry';
    if (stage === 2) return 'Basic Information';
    if (stage === 3) return 'Contact Details';
    if (stage === 4) return 'Address & Settings';
    return 'Create Company';
  };

  const renderStageContent = () => {
    if (stage === 0) {
      return <CreationMethodStage onSelect={handleMethodSelect} />;
    }
    if (stage === 1) {
      return <BrunnøysundSearchStage onCompanySelect={handleBrregCompanySelect} />;
    }
    if (stage === 2) {
      return <BasicInfoStage form={form} logo={logo} />;
    }
    if (stage === 3) {
      return <ContactDetailsStage form={form} />;
    }
    if (stage === 4) {
      return <AddressAndSettingsStage form={form} users={users} hasMarketingType={hasMarketingType} />;
    }
    return null;
  };

  console.log('MultiStageCompanyDialog: Rendering at stage', stage, 'with defaultValues:', !!defaultValues);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{parentId ? 'Add Subsidiary' : 'New Company'}</DialogTitle>
          <DialogDescription>
            {getStageTitle()}
          </DialogDescription>
        </DialogHeader>

        {stage > 0 && <ProgressStepper currentStep={stage} totalSteps={totalStages} />}

        <Form {...form}>
          <form className="space-y-4">
            {renderStageContent()}

            {stage > 0 && (
              <DialogFooter className="flex justify-between pt-4 sm:justify-between">
                <div>
                  {stage > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goBack}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  {stage >= 2 && (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className={cn(
                        "flex items-center gap-1 bg-black hover:bg-black/90",
                        stage === totalStages - 1 ? "" : "bg-black hover:bg-black/90"
                      )}
                      disabled={createCompanyMutation.isPending || !isFormReady}
                    >
                      {createCompanyMutation.isPending
                        ? 'Creating...'
                        : stage === totalStages - 1
                          ? 'Create Company'
                          : (
                            <>
                              Next <ChevronRight className="h-4 w-4" />
                            </>
                          )
                      }
                    </Button>
                  )}
                </div>
              </DialogFooter>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

