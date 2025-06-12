import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { ContractTitleContactStage } from './MultiStageProjectContractDialog/ContractTitleContactStage';
import { ProjectContractConfirmationStage } from './ProjectContractConfirmationStage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProgressStepper } from '@/components/ui/progress-stepper';

interface MultiStageProjectContractDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  companyId: string;
  projectName: string;
  onSuccess?: () => void; // Add optional success callback
}

interface FormData {
  title: string;
  contactId: string;
  templateId: string;
}

export const MultiStageProjectContractDialog: React.FC<MultiStageProjectContractDialogProps> = ({
  isOpen,
  onClose,
  projectId,
  companyId,
  projectName,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    contactId: '',
    templateId: ''
  });
  const queryClient = useQueryClient();

  const { data: contacts = [] } = useQuery({
    queryKey: ['company-contacts', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_contacts')
        .select(`
          id,
          user_id,
          position,
          profiles:user_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('company_id', companyId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['contract-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contract_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });

  const createContract = useMutation({
    mutationFn: async (contractData: FormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the selected template
      const template = templates.find(t => t.id === contractData.templateId);
      if (!template) throw new Error('Template not found');

      const { data, error } = await supabase
        .from('contracts')
        .insert({
          company_id: companyId,
          contact_id: contractData.contactId,
          project_id: projectId,
          template_type: template.type,
          content: template.content,
          title: contractData.title,
          status: 'unsigned',
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Contract created successfully');
      // Invalidate the project contract query to refresh the card
      queryClient.invalidateQueries({ queryKey: ['project-contract', projectId] });
      // Call the optional success callback
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Failed to create contract: ${error.message}`);
    }
  });

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    createContract.mutate(formData);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() !== '' && formData.contactId !== '' && formData.templateId !== '';
      default:
        return false;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ContractTitleContactStage
            title={formData.title}
            contactId={formData.contactId}
            templateId={formData.templateId}
            contacts={contacts}
            templates={templates}
            onTitleChange={(title) => setFormData(prev => ({ ...prev, title }))}
            onContactChange={(contactId) => setFormData(prev => ({ ...prev, contactId }))}
            onTemplateChange={(templateId) => setFormData(prev => ({ ...prev, templateId }))}
          />
        );
      case 2:
        return (
          <ProjectContractConfirmationStage
            formData={formData}
            contacts={contacts}
            templates={templates}
            projectName={projectName}
            companyId={companyId}
          />
        );
      default:
        return null;
    }
  };

  const totalSteps = 2;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Project Contract</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <ProgressStepper currentStep={currentStep} totalSteps={totalSteps} />
          
          {renderCurrentStep()}

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onClose : handlePrevious}
              disabled={createContract.isPending}
            >
              {currentStep === 1 ? (
                'Cancel'
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </>
              )}
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceedToNext() || createContract.isPending}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createContract.isPending}
              >
                {createContract.isPending ? (
                  'Creating...'
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Create Contract
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
