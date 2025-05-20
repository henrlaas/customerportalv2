
// ----- Imports
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
import { companyFormSchema, CompanyFormValues, MultiStageCompanyDialogProps } from './types';
import { useAuth } from '@/contexts/AuthContext';
import { ProgressStepper } from '@/components/ui/progress-stepper';
// Newly added componentized stages and constants
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
  const [stage, setStage] = useState(1);
  const [logo, setLogo] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const totalStages = 3;

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
      country: 'Norge',
      parent_id: parentId || '',
      trial_period: false,
      is_partner: false,
      advisor_id: user?.id || '',
      mrr: 0,
      ...defaultValues,
    },
    mode: 'onChange', // Enable validation as fields change
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

  const createCompanyMutation = useMutation({
    mutationFn: async (values: CompanyFormValues) => {
      const companyData = {
        ...values,
        logo_url: logo,
        parent_id: values.parent_id || null,
        client_types: values.client_types,
        mrr: hasMarketingType ? values.mrr : null,
        name: values.name,
        country: 'Norge',
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
      setStage(1);
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

  const handleNextStage = async () => {
    if (stage === 1) {
      // Validate only basic info fields
      const result = await form.trigger(['name', 'organization_number', 'client_types']);
      if (result) {
        setStage(2);
      }
    } else if (stage === 2) {
      // Validate only contact details fields
      const result = await form.trigger(['website', 'phone', 'invoice_email']);
      if (result) {
        setStage(3);
      }
    }
  };

  const onSubmit = async (values: CompanyFormValues) => {
    if (stage < totalStages) {
      await handleNextStage();
    } else {
      // If we're on the final stage, submit the form
      createCompanyMutation.mutate(values);
    }
  };

  const goBack = () => {
    if (stage > 1) {
      setStage(stage - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{parentId ? 'Add Subsidiary' : 'New Company'}</DialogTitle>
          <DialogDescription>
            Step {stage} of {totalStages}: {
              stage === 1 ? 'Basic Information' :
              stage === 2 ? 'Contact Details' :
              'Address & Settings'
            }
          </DialogDescription>
        </DialogHeader>

        <ProgressStepper currentStep={stage} totalSteps={totalStages} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {stage === 1 && <BasicInfoStage form={form} logo={logo} />}
            {stage === 2 && <ContactDetailsStage form={form} />}
            {stage === 3 && <AddressAndSettingsStage form={form} users={users} hasMarketingType={hasMarketingType} />}

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
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                {stage < totalStages ? (
                  <Button
                    type="button"
                    className="flex items-center gap-1 bg-black hover:bg-black/90"
                    onClick={handleNextStage}
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex items-center gap-1 bg-black hover:bg-black/90"
                    disabled={createCompanyMutation.isPending}
                  >
                    {createCompanyMutation.isPending ? 'Creating...' : 'Create Company'}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
