
import { useState, useEffect } from 'react';
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
import { companyFormSchema, CompanyFormValues, MultiStageCompanyDialogProps, CreationMethod, BrunnøysundCompany } from './types';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressStepper } from '@/components/ui/progress-stepper';
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
  const [stage, setStage] = useState(0); // Start at 0 for creation method selection
  const [creationMethod, setCreationMethod] = useState<CreationMethod | null>(null);
  const [selectedBrunnøysundCompany, setSelectedBrunnøysundCompany] = useState<BrunnøysundCompany | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const totalStages = creationMethod ? 4 : 1; // 0: method selection, 1: basic info, 2: contact, 3: address

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
      country: 'Norway',
      parent_id: parentId || '',
      trial_period: false,
      is_partner: false,
      advisor_id: user?.id || '',
      mrr: 0,
      ...defaultValues,
    },
  });

  const website = form.watch('website');
  const clientTypes = form.watch('client_types');
  const hasMarketingType = clientTypes?.includes(CLIENT_TYPES.MARKETING);

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
    if (selectedBrunnøysundCompany) {
      const address = selectedBrunnøysundCompany.forretningsadresse;
      form.setValue('name', selectedBrunnøysundCompany.navn);
      form.setValue('organization_number', selectedBrunnøysundCompany.organisasjonsnummer);
      
      if (address) {
        if (address.land) form.setValue('country', address.land);
        if (address.postnummer) form.setValue('postal_code', address.postnummer);
        if (address.poststed) form.setValue('city', address.poststed);
        if (address.adresse?.[0]) form.setValue('street_address', address.adresse[0]);
      }
    }
  }, [selectedBrunnøysundCompany, form]);

  const createCompanyMutation = useMutation({
    mutationFn: async (values: CompanyFormValues) => {
      const companyData = {
        ...values,
        logo_url: logo,
        parent_id: values.parent_id || null,
        client_types: values.client_types,
        mrr: hasMarketingType ? values.mrr : null,
        name: values.name,
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
      
      // Reset all state
      form.reset();
      setStage(0);
      setCreationMethod(null);
      setSelectedBrunnøysundCompany(null);
      setLogo(null);
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

  const handleMethodSelect = (method: CreationMethod) => {
    setCreationMethod(method);
    if (method === 'manual') {
      setStage(1); // Skip Brunnøysund search, go directly to basic info
    } else {
      setStage(1); // Go to Brunnøysund search stage
    }
  };

  const handleBrunnøysundCompanySelect = (company: BrunnøysundCompany) => {
    setSelectedBrunnøysundCompany(company);
  };

  const onSubmit = (values: CompanyFormValues) => {
    if (stage < totalStages - 1) {
      setStage(stage + 1);
    } else {
      createCompanyMutation.mutate(values);
    }
  };

  const goBack = () => {
    if (stage > 0) {
      setStage(stage - 1);
      if (stage === 1 && creationMethod === 'brunnøysund') {
        // Going back from Brunnøysund search to method selection
        setCreationMethod(null);
        setSelectedBrunnøysundCompany(null);
        setStage(0);
      }
    }
  };

  const getStageTitle = () => {
    if (stage === 0) return 'Creation Method';
    if (creationMethod === 'brunnøysund' && stage === 1) return 'Search Company';
    if (creationMethod === 'brunnøysund' && stage === 2) return 'Basic Information';
    if (creationMethod === 'brunnøysund' && stage === 3) return 'Contact Details';
    if (creationMethod === 'brunnøysund' && stage === 4) return 'Address & Settings';
    if (creationMethod === 'manual' && stage === 1) return 'Basic Information';
    if (creationMethod === 'manual' && stage === 2) return 'Contact Details';
    if (creationMethod === 'manual' && stage === 3) return 'Address & Settings';
    return '';
  };

  const canProceed = () => {
    if (stage === 0) return false; // Method selection doesn't use form submission
    if (creationMethod === 'brunnøysund' && stage === 1) return selectedBrunnøysundCompany !== null;
    return true;
  };

  const handleNext = () => {
    if (stage === 0) return; // This should not happen
    if (creationMethod === 'brunnøysund' && stage === 1) {
      // Move from Brunnøysund search to basic info
      setStage(2);
      return;
    }
    // For all other stages, use form submission
    form.handleSubmit(onSubmit)();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      // Reset all state when closing
      setStage(0);
      setCreationMethod(null);
      setSelectedBrunnøysundCompany(null);
      setLogo(null);
      onClose();
    }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{parentId ? 'Add Subsidiary' : 'New Company'}</DialogTitle>
          {stage > 0 && (
            <DialogDescription>
              {getStageTitle()}
            </DialogDescription>
          )}
        </DialogHeader>

        {stage > 0 && creationMethod && (
          <ProgressStepper 
            currentStep={creationMethod === 'brunnøysund' ? stage - 1 : stage} 
            totalSteps={creationMethod === 'brunnøysund' ? 4 : 3} 
          />
        )}

        {stage === 0 && (
          <CreationMethodStage onMethodSelect={handleMethodSelect} />
        )}

        {stage === 1 && creationMethod === 'brunnøysund' && (
          <BrunnøysundSearchStage
            onCompanySelect={handleBrunnøysundCompanySelect}
            selectedCompany={selectedBrunnøysundCompany}
          />
        )}

        {((stage === 1 && creationMethod === 'manual') || 
          (stage === 2 && creationMethod === 'brunnøysund')) && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <BasicInfoStage form={form} logo={logo} />
            </form>
          </Form>
        )}

        {((stage === 2 && creationMethod === 'manual') || 
          (stage === 3 && creationMethod === 'brunnøysund')) && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ContactDetailsStage form={form} />
            </form>
          </Form>
        )}

        {((stage === 3 && creationMethod === 'manual') || 
          (stage === 4 && creationMethod === 'brunnøysund')) && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <AddressAndSettingsStage form={form} users={users} hasMarketingType={hasMarketingType} />
            </form>
          </Form>
        )}

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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {stage === 0 ? null : (
              <Button
                type={stage === 1 && creationMethod === 'brunnøysund' ? 'button' : 'submit'}
                onClick={stage === 1 && creationMethod === 'brunnøysund' ? handleNext : undefined}
                className={cn(
                  "flex items-center gap-1 bg-black hover:bg-black/90"
                )}
                disabled={
                  createCompanyMutation.isPending || 
                  !canProceed() ||
                  (stage === 1 && creationMethod === 'brunnøysund' && !selectedBrunnøysundCompany)
                }
              >
                {createCompanyMutation.isPending
                  ? 'Creating...'
                  : stage === totalStages - 1 || (creationMethod === 'manual' && stage === 3) || (creationMethod === 'brunnøysund' && stage === 4)
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
      </DialogContent>
    </Dialog>
  );
}
