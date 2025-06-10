import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createContract, replacePlaceholders } from '@/utils/contractUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEmailSender } from '@/hooks/useEmailSender';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProgressStepper } from '@/components/ui/progress-stepper';
import { CompanySelectionStage } from './CompanySelectionStage';
import { ContactSelectionStage } from './ContactSelectionStage';
import { TemplateSelectionStage } from './TemplateSelectionStage';
import { ConfirmationStage } from './ConfirmationStage';
import { FormData } from './types';

interface MultiStageContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MultiStageContractDialog({ isOpen, onClose }: MultiStageContractDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const emailSender = useEmailSender();
  
  const [formData, setFormData] = useState<FormData>({
    company: null,
    contact: null,
    template: null,
  });

  // Function to fetch email template from workspace settings
  const fetchEmailTemplate = async () => {
    const { data, error } = await supabase
      .from('workspace_settings')
      .select('setting_value')
      .eq('setting_key', 'email.template.default')
      .single();
    
    if (error || !data) {
      console.error('Error fetching email template:', error);
      return null;
    }
    
    return data.setting_value;
  };

  // Function to get contact's email
  const getContactEmail = async (contactUserId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name
      `)
      .eq('id', contactUserId)
      .single();

    if (error) {
      console.error('Error fetching contact profile:', error);
      return null;
    }

    // Get email from auth.users using the get_users_email function
    const { data: emailData, error: emailError } = await supabase
      .rpc('get_users_email', { user_ids: [contactUserId] });

    if (emailError || !emailData || emailData.length === 0) {
      console.error('Error fetching contact email:', emailError);
      return null;
    }

    return {
      email: emailData[0].email,
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim()
    };
  };

  // Function to send contract notification email
  const sendContractNotificationEmail = async () => {
    if (!formData.contact) return;

    try {
      // Fetch email template
      const emailTemplate = await fetchEmailTemplate();
      if (!emailTemplate) {
        console.warn('No email template found, skipping email notification');
        return;
      }

      // Get contact's email
      const contactInfo = await getContactEmail(formData.contact.user_id);
      if (!contactInfo) {
        console.warn('Contact email not found, skipping email notification');
        return;
      }

      // Replace placeholders in email template
      const subject = "A new contract is ready to sign";
      const message = "A new contract is ready to be signed in Box Workspace. Please login to review and sign the contract.";
      
      let emailContent = emailTemplate;
      emailContent = emailContent.replace(/\$\{data\.subject\}/g, subject);
      emailContent = emailContent.replace(/\$\{data\.message\}/g, message);

      // Send email
      emailSender.mutate({
        to: contactInfo.email,
        subject: subject,
        html: emailContent
      });

      console.log(`Contract notification email sent to ${contactInfo.email}`);
    } catch (error) {
      console.error('Error sending contract notification email:', error);
      // Don't show error to user since this is a secondary feature
    }
  };

  const createContractMutation = useMutation({
    mutationFn: async () => {
      if (!user || !formData.company || !formData.contact || !formData.template) {
        throw new Error("Missing required data to create contract");
      }

      // Prepare placeholder data for replacement
      const placeholderData = {
        company: {
          name: formData.company.name,
          organization_number: formData.company.organization_number,
          street_address: formData.company.street_address,
          address: formData.company.street_address,
          postal_code: formData.company.postal_code,
          city: formData.company.city,
          country: formData.company.country,
          mrr: formData.company.mrr
        },
        contact: {
          first_name: formData.contact.first_name,
          last_name: formData.contact.last_name,
          position: formData.contact.position
        }
      };

      // Replace placeholders in the template content
      const processedContent = replacePlaceholders(formData.template.content, placeholderData);

      const contractData = {
        company_id: formData.company.id,
        contact_id: formData.contact.id,
        template_type: formData.template.type,
        content: processedContent, // Use the processed content with placeholders replaced
        title: `${formData.template.name} - ${formData.company.name}`,
        created_by: user.id,
      };
      
      return await createContract(contractData);
    },
    onSuccess: async () => {
      toast({
        title: 'Contract created',
        description: 'The contract has been created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      
      // Send email notification after successful contract creation
      await sendContractNotificationEmail();
      
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create contract: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      company: null,
      contact: null,
      template: null,
    });
    onClose();
  };

  const goToNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.company !== null;
      case 2:
        return formData.contact !== null;
      case 3:
        return formData.template !== null;
      case 4:
        return formData.company && formData.contact && formData.template;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Select Company';
      case 2:
        return 'Select Contact';
      case 3:
        return 'Select Template';
      case 4:
        return 'Confirmation';
      default:
        return '';
    }
  };

  const handleSubmit = () => {
    if (currentStep < totalSteps) {
      goToNextStep();
    } else {
      createContractMutation.mutate();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <CompanySelectionStage formData={formData} setFormData={setFormData} />;
      case 2:
        return <ContactSelectionStage formData={formData} setFormData={setFormData} />;
      case 3:
        return <TemplateSelectionStage formData={formData} setFormData={setFormData} />;
      case 4:
        return <ConfirmationStage formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Contract</DialogTitle>
        </DialogHeader>

        <ProgressStepper currentStep={currentStep} totalSteps={totalSteps} />
        
        <div className="py-4">
          {renderCurrentStep()}
        </div>
        
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="flex items-center gap-1"
              disabled={!canProceedToNext() || createContractMutation.isPending}
            >
              {createContractMutation.isPending 
                ? 'Creating...' 
                : currentStep === totalSteps 
                  ? 'Create Contract' 
                  : (
                    <>
                      Next <ChevronRight className="h-4 w-4" />
                    </>
                  )
              }
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
