
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase, updateWithUser } from '@/integrations/supabase/client';
import { CompanySelectionForm } from '../MultiStageDealDialog/CompanySelectionForm';
import { ExistingCompanyForm } from '../MultiStageDealDialog/ExistingCompanyForm';
import { NewCompanyForm } from '../MultiStageDealDialog/NewCompanyForm';
import { ContactForm } from '../MultiStageDealDialog/ContactForm';
import { DealDetailsStage1Form } from '../MultiStageDealDialog/DealDetailsStage1Form';
import { DealDetailsStage2Form } from '../MultiStageDealDialog/DealDetailsStage2Form';
import { ProgressStepper } from '../MultiStageDealDialog/ProgressStepper';
import { Deal, Company, Stage, Profile } from '@/components/Deals/types/deal';

type CompanySelection = 'existing' | 'new' | null;

interface EditDealDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal | null;
  companies: Company[];
  stages: Stage[];
  profiles: Profile[];
}

type Step = 
  | { type: 'company-selection' }
  | { type: 'existing-company' }
  | { type: 'new-company' }
  | { type: 'contact-info' }
  | { type: 'deal-details-1' }
  | { type: 'deal-details-2' };

export const EditDealDialog: React.FC<EditDealDialogProps> = ({
  isOpen,
  onClose,
  deal,
  companies,
  stages,
  profiles,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<Step>({ type: 'company-selection' });
  const [companySelection, setCompanySelection] = useState<CompanySelection>(null);
  const [formData, setFormData] = useState<any>({});

  // Reset form when deal changes or dialog opens
  useEffect(() => {
    if (isOpen && deal) {
      // If deal has a company, start at deal details
      if (deal.company_id) {
        setCompanySelection('existing');
        setFormData({ existingCompanyId: deal.company_id });
        setCurrentStep({ type: 'deal-details-1' });
      } else {
        // Check if there is a temp company
        fetchTempDealData();
      }
    }
  }, [isOpen, deal]);

  // Fetch temp company and contact data if they exist
  const fetchTempDealData = async () => {
    if (!deal) return;
    
    // Check for temp company
    const { data: tempCompany } = await supabase
      .from('temp_deal_companies')
      .select('*')
      .eq('deal_id', deal.id)
      .single();
    
    // Check for temp contact
    const { data: tempContact } = await supabase
      .from('temp_deal_contacts')
      .select('*')
      .eq('deal_id', deal.id)
      .single();
    
    if (tempCompany) {
      setCompanySelection('new');
      setFormData({
        newCompany: {
          company_name: tempCompany.company_name,
          organization_number: tempCompany.organization_number || '',
          website: tempCompany.website || '',
        }
      });

      if (tempContact) {
        setFormData(prev => ({
          ...prev,
          contactInfo: {
            first_name: tempContact.first_name,
            last_name: tempContact.last_name,
            email: tempContact.email,
            phone: tempContact.phone || '',
            position: tempContact.position || '',
          }
        }));
        setCurrentStep({ type: 'deal-details-1' });
      } else {
        setCurrentStep({ type: 'new-company' });
      }
    } else {
      // No company at all
      setCurrentStep({ type: 'company-selection' });
      setCompanySelection(null);
    }
  };

  const updateDealMutation = useMutation({
    mutationFn: async (dealData: any) => {
      if (!deal) return null;

      // Update the deal
      const { data: updatedDeal, error: dealError } = await updateWithUser('deals', deal.id, {
        title: dealData.dealDetails.title,
        description: dealData.dealDetails.description,
        deal_type: dealData.dealDetails.deal_type,
        client_deal_type: dealData.dealDetails.client_deal_type,
        value: dealData.dealDetails.value,
        price_type: dealData.dealDetails.price_type,
        assigned_to: dealData.dealDetails.assigned_to,
        company_id: dealData.existingCompanyId || null,
        is_recurring: dealData.dealDetails.deal_type === 'recurring',
      });

      if (dealError) throw dealError;

      // Handle temp company and contact updates
      if (!dealData.existingCompanyId) {
        // Check if temp company already exists
        const { data: existingTempCompany } = await supabase
          .from('temp_deal_companies')
          .select('id')
          .eq('deal_id', deal.id)
          .single();

        if (existingTempCompany) {
          // Update existing temp company
          const { error: tempCompanyError } = await supabase
            .from('temp_deal_companies')
            .update({
              company_name: dealData.newCompany.company_name,
              organization_number: dealData.newCompany.organization_number,
              website: dealData.newCompany.website,
            })
            .eq('deal_id', deal.id);

          if (tempCompanyError) throw tempCompanyError;
        } else {
          // Create new temp company
          const { error: tempCompanyError } = await supabase
            .from('temp_deal_companies')
            .insert({
              deal_id: deal.id,
              company_name: dealData.newCompany.company_name,
              organization_number: dealData.newCompany.organization_number,
              website: dealData.newCompany.website,
              created_by: user?.id,
            });

          if (tempCompanyError) throw tempCompanyError;
        }

        // Check if temp contact already exists
        const { data: existingTempContact } = await supabase
          .from('temp_deal_contacts')
          .select('id')
          .eq('deal_id', deal.id)
          .single();

        if (existingTempContact) {
          // Update existing temp contact
          const { error: tempContactError } = await supabase
            .from('temp_deal_contacts')
            .update({
              first_name: dealData.contactInfo.first_name,
              last_name: dealData.contactInfo.last_name,
              email: dealData.contactInfo.email,
              phone: dealData.contactInfo.phone,
              position: dealData.contactInfo.position,
            })
            .eq('deal_id', deal.id);

          if (tempContactError) throw tempContactError;
        } else {
          // Create new temp contact
          const { error: tempContactError } = await supabase
            .from('temp_deal_contacts')
            .insert({
              deal_id: deal.id,
              first_name: dealData.contactInfo.first_name,
              last_name: dealData.contactInfo.last_name,
              email: dealData.contactInfo.email,
              phone: dealData.contactInfo.phone,
              position: dealData.contactInfo.position,
              created_by: user?.id,
            });

          if (tempContactError) throw tempContactError;
        }
      } else {
        // If selecting an existing company, delete any temp data
        await supabase.from('temp_deal_companies').delete().eq('deal_id', deal.id);
        await supabase.from('temp_deal_contacts').delete().eq('deal_id', deal.id);
      }

      return updatedDeal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: 'Success',
        description: 'Deal updated successfully',
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating deal',
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
    
    updateDealMutation.mutate({
      ...formData,
      dealDetails: combinedDealDetails,
    });
  };

  const renderStep = () => {
    if (!deal) return null;

    switch (currentStep.type) {
      case 'company-selection':
        return <CompanySelectionForm onNext={handleCompanySelection} />;
      case 'existing-company':
        return (
          <ExistingCompanyForm
            onNext={handleExistingCompanyNext}
            onBack={() => setCurrentStep({ type: 'company-selection' })}
            defaultValue={deal.company_id || undefined}
          />
        );
      case 'new-company':
        return (
          <NewCompanyForm
            onNext={handleNewCompanyNext}
            onBack={() => setCurrentStep({ type: 'company-selection' })}
            defaultValues={formData.newCompany}
          />
        );
      case 'contact-info':
        return (
          <ContactForm
            onNext={handleContactNext}
            onBack={() => setCurrentStep({ type: 'new-company' })}
            defaultValues={formData.contactInfo}
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
            defaultValues={{
              title: deal.title,
              description: deal.description || '',
              ...formData.dealDetailsStage1
            }}
          />
        );
      case 'deal-details-2':
        return (
          <DealDetailsStage2Form
            onSubmit={handleDealDetailsStage2Submit}
            onBack={() => setCurrentStep({ type: 'deal-details-1' })}
            isSubmitting={updateDealMutation.isPending}
            defaultValues={{
              deal_type: deal.deal_type || 'one-time',
              client_deal_type: deal.client_deal_type || 'web',
              value: deal.value || 0,
              price_type: deal.price_type || 'Project',
              assigned_to: deal.assigned_to || '',
              ...formData.dealDetailsStage2
            }}
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Deal - {getStepTitle()}</DialogTitle>
        </DialogHeader>
        <ProgressStepper currentStep={currentStep.type} />
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};
