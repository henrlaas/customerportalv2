
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
import { CompanyDataReviewStage } from './CompanyDataReviewStage';
import { CompanyDetailsStage } from './CompanyDetailsStage';
import { CompanySettingsStage } from './CompanySettingsStage';
import { convertTempCompanySchema, ConvertTempCompanyFormValues } from './types';

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
  const totalStages = 3;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch users for advisor selection
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.listUsers(),
  });

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
      country: tempCompany?.country || 'Norway',
      
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
      case 1: // Company Data Review
        fieldsToValidate = ['name', 'organization_number', 'website', 'phone', 'client_types'];
        break;
      case 2: // Company Details
        fieldsToValidate = ['invoice_email', 'street_address', 'city', 'postal_code'];
        break;
      case 3: // Company Settings (final stage)
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
      case 1: return 'Review Company Data';
      case 2: return 'Complete Company Details';
      case 3: return 'Company Settings';
      default: return 'Convert Company';
    }
  };

  const renderStageContent = () => {
    switch (currentStage) {
      case 1:
        return <CompanyDataReviewStage form={form} />;
      case 2:
        return <CompanyDetailsStage form={form} />;
      case 3:
        return <CompanySettingsStage form={form} users={users} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
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
