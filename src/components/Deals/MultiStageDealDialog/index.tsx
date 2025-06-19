
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { CompanySelectionForm } from './CompanySelectionForm';
import { ExistingCompanyForm } from './ExistingCompanyForm';
import { NewCompanyForm } from './NewCompanyForm';
import { ContactForm } from './ContactForm';
import { DealDetailsStage1Form } from './DealDetailsStage1Form';
import { DealDetailsStage2Form } from './DealDetailsStage2Form';
import { ProgressStepper } from './ProgressStepper';

type CompanySelection = 'existing' | 'new' | null;

interface MultiStageDealDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 
  | { type: 'company-selection' }
  | { type: 'existing-company' }
  | { type: 'new-company' }
  | { type: 'contact-info' }
  | { type: 'deal-details-1' }
  | { type: 'deal-details-2' };

export const MultiStageDealDialog: React.FC<MultiStageDealDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<Step>({ type: 'company-selection' });
  const [companySelection, setCompanySelection] = useState<CompanySelection>(null);
  const [formData, setFormData] = useState<any>({});

  const createDealMutation = useMutation({
    mutationFn: async (dealData: any) => {
      let dealId: string | undefined;
      
      // Use the specific Lead stage ID
      const leadStageId = "5ac493ab-84be-4203-bb92-b7c310bc2128";

      // Start a transaction
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .insert({
          title: dealData.dealDetails.title,
          description: dealData.dealDetails.description,
          deal_type: dealData.dealDetails.deal_type,
          client_deal_type: dealData.dealDetails.client_deal_type,
          value: dealData.dealDetails.value,
          price_type: dealData.dealDetails.price_type,
          assigned_to: dealData.dealDetails.assigned_to,
          company_id: dealData.existingCompanyId || null,
          is_recurring: dealData.dealDetails.deal_type === 'recurring',
          created_by: user?.id,
          stage_id: leadStageId, // Set the specific Lead stage ID
        })
        .select()
        .single();

      if (dealError) throw dealError;
      dealId = deal.id;

      if (!dealData.existingCompanyId) {
        // Create temporary company with enhanced address data
        const { error: tempCompanyError } = await supabase
          .from('temp_deal_companies')
          .insert({
            deal_id: dealId,
            company_name: dealData.newCompany.company_name,
            organization_number: dealData.newCompany.organization_number,
            website: dealData.newCompany.website,
            street_address: dealData.newCompany.street_address || null,
            city: dealData.newCompany.city || null,
            postal_code: dealData.newCompany.postal_code || null,
            country: dealData.newCompany.country || 'Norge',
            created_by: user?.id,
          });

        if (tempCompanyError) throw tempCompanyError;

        // Create temporary contact
        const { error: tempContactError } = await supabase
          .from('temp_deal_contacts')
          .insert({
            deal_id: dealId,
            first_name: dealData.contactInfo.first_name,
            last_name: dealData.contactInfo.last_name,
            email: dealData.contactInfo.email,
            phone: dealData.contactInfo.phone,
            position: dealData.contactInfo.position,
            created_by: user?.id,
          });

        if (tempContactError) throw tempContactError;
      }

      return deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: 'Success',
        description: 'Deal created successfully',
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating deal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleClose = () => {
    setCurrentStep({ type: 'company-selection' });
    setCompanySelection(null);
    setFormData({});
    onClose();
  };

  const handleCompanySelection = (selection: 'existing' | 'new') => {
    setCompanySelection(selection);
    setCurrentStep({ 
      type: selection === 'existing' ? 'existing-company' : 'new-company' 
    });
  };

  const handleExistingCompanyNext = (companyId: string) => {
    setFormData({ ...formData, existingCompanyId: companyId });
    setCurrentStep({ type: 'deal-details-1' });
  };

  const handleNewCompanyNext = (companyData: any) => {
    setFormData({ ...formData, newCompany: companyData });
    setCurrentStep({ type: 'contact-info' });
  };

  const handleContactNext = (contactData: any) => {
    setFormData({ ...formData, contactInfo: contactData });
    setCurrentStep({ type: 'deal-details-1' });
  };

  const handleDealDetailsStage1Next = (dealData: any) => {
    setFormData({ ...formData, dealDetailsStage1: dealData });
    setCurrentStep({ type: 'deal-details-2' });
  };

  const handleDealDetailsStage2Submit = (dealData: any) => {
    const combinedDealDetails = {
      ...formData.dealDetailsStage1,
      ...dealData
    };
    
    createDealMutation.mutate({
      ...formData,
      dealDetails: combinedDealDetails,
    });
  };

  const renderStep = () => {
    switch (currentStep.type) {
      case 'company-selection':
        return <CompanySelectionForm onNext={handleCompanySelection} />;
      case 'existing-company':
        return (
          <ExistingCompanyForm
            onNext={handleExistingCompanyNext}
            onBack={() => setCurrentStep({ type: 'company-selection' })}
          />
        );
      case 'new-company':
        return (
          <NewCompanyForm
            onNext={handleNewCompanyNext}
            onBack={() => setCurrentStep({ type: 'company-selection' })}
          />
        );
      case 'contact-info':
        return (
          <ContactForm
            onNext={handleContactNext}
            onBack={() => setCurrentStep({ type: 'new-company' })}
          />
        );
      case 'deal-details-1':
        return (
          <DealDetailsStage1Form
            onNext={handleDealDetailsStage1Next}
            onBack={() => {
              if (companySelection === 'existing') {
                setCurrentStep({ type: 'existing-company' });
              } else {
                setCurrentStep({ type: 'contact-info' });
              }
            }}
            defaultValues={formData.dealDetailsStage1}
          />
        );
      case 'deal-details-2':
        return (
          <DealDetailsStage2Form
            onSubmit={handleDealDetailsStage2Submit}
            onBack={() => setCurrentStep({ type: 'deal-details-1' })}
            isSubmitting={createDealMutation.isPending}
            defaultValues={formData.dealDetailsStage2}
          />
        );
    }
  };

  const getStepTitle = () => {
    switch (currentStep.type) {
      case 'company-selection':
        return 'Select Company Type';
      case 'existing-company':
        return 'Choose Existing Company';
      case 'new-company':
        return 'New Company Details';
      case 'contact-info':
        return 'Contact Information';
      case 'deal-details-1':
        return 'Deal Information';
      case 'deal-details-2':
        return 'Deal Details';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
        </DialogHeader>
        <ProgressStepper currentStep={currentStep.type} />
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};
