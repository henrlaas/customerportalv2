
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createContract } from '@/utils/contractUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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
  
  const [formData, setFormData] = useState<FormData>({
    company: null,
    contact: null,
    template: null,
  });

  const createContractMutation = useMutation({
    mutationFn: async () => {
      if (!user || !formData.company || !formData.contact || !formData.template) {
        throw new Error("Missing required data to create contract");
      }

      const contractData = {
        company_id: formData.company.id,
        contact_id: formData.contact.id,
        template_type: formData.template.type,
        content: formData.template.content,
        title: `${formData.template.name} - ${formData.company.name}`,
        created_by: user.id,
      };
      
      return await createContract(contractData);
    },
    onSuccess: () => {
      toast({
        title: 'Contract created',
        description: 'The contract has been created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
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
          <DialogDescription>
            Step {currentStep} of {totalSteps}: {getStepTitle()}
          </DialogDescription>
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
