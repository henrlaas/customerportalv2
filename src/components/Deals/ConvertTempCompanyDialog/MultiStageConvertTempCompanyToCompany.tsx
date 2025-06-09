
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { userService } from '@/services/userService';
import { companyService } from '@/services/companyService';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressStepper } from '@/components/ui/progress-stepper';
import { CompanyBasicInfoStage } from './CompanyBasicInfoStage';
import { ContactInformationStage } from './ContactInformationStage';
import { ClientTypeAndMrrStage } from './ClientTypeAndMrrStage';
import { AddressInformationStage } from './AddressInformationStage';
import { CompanySettingsStage } from './CompanySettingsStage';
import { convertTempCompanySchema, ConvertTempCompanyFormValues, AdvisorOption } from './types';

interface MultiStageConvertTempCompanyToCompanyProps {
  isOpen: boolean;
  onClose: () => void;
  dealId: string;
  tempCompany: any;
  tempContact: any;
  dealValue: number | null;
  dealType: string | null;
}

export const MultiStageConvertTempCompanyToCompany = ({
  isOpen,
  onClose,
  dealId,
  tempCompany,
  tempContact,
  dealValue,
  dealType
}: MultiStageConvertTempCompanyToCompanyProps) => {
  const [currentStage, setCurrentStage] = useState(1);
  const totalStages = 5;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch users for advisor selection (admin and employees only)
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.listUsers(),
  });

  // Filter users to only include admins and employees, and format for react-select
  const advisorOptions: AdvisorOption[] = users
    .filter(user => user.role === 'admin' || user.role === 'employee')
    .map(user => ({
      value: user.id,
      label: user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}`
        : user.email || user.id,
      avatar_url: user.avatar_url,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email || ''
    }));

  const form = useForm<ConvertTempCompanyFormValues>({
    resolver: zodResolver(convertTempCompanySchema),
    defaultValues: {
      // Pre-filled from temp company data
      name: tempCompany?.company_name || '',
      organization_number: tempCompany?.organization_number || '',
      website: tempCompany?.website || '',
      phone: tempContact?.phone || '',
      street_address: tempCompany?.street_address || '',
      city: tempCompany?.city || '',
      postal_code: tempCompany?.postal_code || '',
      country: tempCompany?.country || 'NO',
      
      // Determine client types from deal type
      client_types: dealType === 'web' ? ['web'] : ['marketing'],
      mrr: dealValue || 0,
      
      // Fields to be filled by user
      invoice_email: '',
      trial_period: false,
      is_partner: false,
      advisor_id: user?.id || '',
    },
  });

  const convertMutation = useMutation({
    mutationFn: async (values: ConvertTempCompanyFormValues) => {
      const companyData = {
        name: values.name,
        organization_number: values.organization_number,
        website: values.website,
        phone: values.phone,
        invoice_email: values.invoice_email,
        street_address: values.street_address,
        city: values.city,
        postal_code: values.postal_code,
        country: values.country,
        client_types: values.client_types,
        mrr: values.client_types.includes('marketing') ? values.mrr : null,
        trial_period: values.trial_period,
        is_partner: values.is_partner,
        advisor_id: values.advisor_id,
      };
      
      return await companyService.convertTempCompany(companyData, dealId);
    },
    onSuccess: () => {
      toast({
        title: 'Company created',
        description: 'Temporary company has been successfully converted to a permanent company',
      });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['temp-deal-companies'] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to convert company: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleNext = async () => {
    let fieldsToValidate: (keyof ConvertTempCompanyFormValues)[] = [];
    
    switch (currentStage) {
      case 1: // Company Basic Info
        fieldsToValidate = ['name', 'organization_number', 'website'];
        break;
      case 2: // Contact Information
        fieldsToValidate = ['phone', 'invoice_email'];
        break;
      case 3: // Client Type & MRR
        fieldsToValidate = ['client_types'];
        // If marketing is selected, also validate MRR
        if (form.getValues('client_types')?.includes('marketing')) {
          fieldsToValidate.push('mrr');
        }
        break;
      case 4: // Address Information
        fieldsToValidate = ['street_address', 'city', 'postal_code'];
        break;
      case 5: // Company Settings (final stage)
        const isValid = await form.trigger();
        if (isValid) {
          convertMutation.mutate(form.getValues());
        }
        return;
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStage(currentStage + 1);
    }
  };

  const handleBack = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
    }
  };

  const getStageTitle = () => {
    switch (currentStage) {
      case 1: return 'Company Basic Information';
      case 2: return 'Contact Information';
      case 3: return 'Client Type & Revenue';
      case 4: return 'Address Information';
      case 5: return 'Company Settings';
      default: return 'Convert Company';
    }
  };

  const renderStageContent = () => {
    switch (currentStage) {
      case 1:
        return <CompanyBasicInfoStage form={form} />;
      case 2:
        return <ContactInformationStage form={form} />;
      case 3:
        return <ClientTypeAndMrrStage form={form} />;
      case 4:
        return <AddressInformationStage form={form} />;
      case 5:
        return <CompanySettingsStage form={form} advisorOptions={advisorOptions} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convert to Company - {getStageTitle()}</DialogTitle>
        </DialogHeader>

        <ProgressStepper currentStep={currentStage} totalSteps={totalStages} />

        <Form {...form}>
          <form className="space-y-4">
            {renderStageContent()}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={currentStage === 1 ? onClose : handleBack}
                className="flex items-center gap-1"
              >
                {currentStage === 1 ? (
                  'Cancel'
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4" /> Back
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                onClick={handleNext}
                disabled={convertMutation.isPending}
                className="flex items-center gap-1"
              >
                {convertMutation.isPending ? (
                  'Converting...'
                ) : currentStage === totalStages ? (
                  'Convert to Company'
                ) : (
                  <>
                    Next <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
