
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
import { ProgressStepper } from '@/components/ui/progress-stepper';
import { companyFormSchema, CompanyFormValues } from '@/components/Companies/MultiStageCompanyDialog/types';
import { BasicInfoStage } from '@/components/Companies/MultiStageCompanyDialog/BasicInfoStage';
import { ContactDetailsStage } from '@/components/Companies/MultiStageCompanyDialog/ContactDetailsStage';
import { AddressAndSettingsStage } from '@/components/Companies/MultiStageCompanyDialog/AddressAndSettingsStage';
import { CLIENT_TYPES } from '@/components/Companies/MultiStageCompanyDialog/ClientTypes';

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
  const [stage, setStage] = useState(1); // Start at 1 (basic info), skip creation method
  const [logo, setLogo] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const totalStages = 3; // Basic info, contact details, address & settings

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
      country: '',
      parent_id: '',
      trial_period: false,
      is_partner: false,
      advisor_id: '',
      mrr: 0,
    },
  });

  const website = form.watch('website');
  const clientTypes = form.watch('client_types');
  const hasMarketingType = clientTypes?.includes(CLIENT_TYPES.MARKETING);
  
  // Fetch company data
  const { data: company, isLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => companyService.fetchCompanyById(companyId),
    enabled: isOpen && !!companyId,
  });
  
  // Update form when company data loads
  useEffect(() => {
    if (company) {
      // Convert company data to match form schema
      const clientTypes = [];
      if (company.is_marketing_client) clientTypes.push(CLIENT_TYPES.MARKETING);
      if (company.is_web_client) clientTypes.push(CLIENT_TYPES.WEB);
      
      form.reset({
        name: company.name || '',
        organization_number: company.organization_number || '',
        client_types: clientTypes.length > 0 ? clientTypes : [CLIENT_TYPES.MARKETING],
        website: company.website || '',
        phone: company.phone || '',
        invoice_email: company.invoice_email || '',
        street_address: company.street_address || '',
        city: company.city || '',
        postal_code: company.postal_code || '',
        country: company.country || '',
        parent_id: company.parent_id || '',
        trial_period: company.trial_period || false,
        is_partner: company.is_partner || false,
        advisor_id: company.advisor_id || '',
        mrr: company.mrr || 0,
      });
      setLogo(company.logo_url || null);
    }
  }, [company, form]);

  // Fetch logo when website changes
  useEffect(() => {
    if (website && website !== company?.website) {
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
  }, [website, company?.website]);
  
  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (values: CompanyFormValues) => {
      const companyData = {
        name: values.name,
        organization_number: values.organization_number,
        website: values.website || null,
        phone: values.phone || null,
        invoice_email: values.invoice_email || null,
        street_address: values.street_address || null,
        city: values.city || null,
        postal_code: values.postal_code || null,
        country: values.country || null,
        trial_period: values.trial_period,
        is_partner: values.is_partner,
        advisor_id: values.advisor_id || null,
        mrr: hasMarketingType ? values.mrr : null,
        logo_url: logo,
        // Convert client_types array back to boolean flags
        is_marketing_client: values.client_types.includes(CLIENT_TYPES.MARKETING),
        is_web_client: values.client_types.includes(CLIENT_TYPES.WEB),
      };
      return companyService.updateCompany(companyId, companyData);
    },
    onSuccess: () => {
      toast({
        title: 'Company updated',
        description: 'The company has been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['company', companyId] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['childCompanies'] });
      setStage(1);
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
  
  const onSubmit = (values: CompanyFormValues) => {
    if (stage < totalStages) {
      setStage(stage + 1);
    } else {
      updateCompanyMutation.mutate(values);
    }
  };

  const goBack = () => {
    if (stage > 1) {
      setStage(stage - 1);
    }
  };

  const handleClose = () => {
    setStage(1);
    onClose();
  };

  const getStageTitle = () => {
    if (stage === 1) return 'Basic Information';
    if (stage === 2) return 'Contact Details';
    if (stage === 3) return 'Address & Settings';
    return 'Edit Company';
  };

  const renderStageContent = () => {
    if (stage === 1) {
      return <BasicInfoStage form={form} logo={logo} />;
    }
    if (stage === 2) {
      return <ContactDetailsStage form={form} />;
    }
    if (stage === 3) {
      return <AddressAndSettingsStage form={form} users={users} hasMarketingType={hasMarketingType} />;
    }
    return null;
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-xl">
          <div className="flex justify-center p-6">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>
            {getStageTitle()}
          </DialogDescription>
        </DialogHeader>

        <ProgressStepper currentStep={stage} totalSteps={totalStages} />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {renderStageContent()}
            
            <DialogFooter className="flex justify-between pt-4 sm:justify-between">
              <div>
                {stage > 1 && (
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
                <Button
                  type="submit"
                  className={cn(
                    "flex items-center gap-1 bg-black hover:bg-black/90",
                    stage === totalStages ? "" : "bg-black hover:bg-black/90"
                  )}
                  disabled={updateCompanyMutation.isPending}
                >
                  {updateCompanyMutation.isPending
                    ? 'Saving...'
                    : stage === totalStages
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
