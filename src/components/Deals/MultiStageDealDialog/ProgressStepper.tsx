
import React from 'react';
import { ProgressStepper as BaseProgressStepper } from '@/components/ui/progress-stepper';

type Step = 'company-selection' | 'existing-company' | 'new-company' | 'contact-info' | 'deal-details-1' | 'deal-details-2';

interface ProgressStepperProps {
  currentStep: Step;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ currentStep }) => {
  const steps = [
    { id: 'company-selection', label: 'Company Type' },
    { id: 'existing-company', label: 'Company' },
    { id: 'contact-info', label: 'Contact' },
    { id: 'deal-details-1', label: 'Deal Info' },
    { id: 'deal-details-2', label: 'Deal Details' },
  ];

  const getCurrentStepIndex = () => {
    if (currentStep === 'new-company') return 1; // Same position as 'existing-company'
    return steps.findIndex(step => step.id === currentStep);
  };

  const currentStepIndex = getCurrentStepIndex();
  
  return (
    <BaseProgressStepper 
      currentStep={currentStepIndex + 1} 
      totalSteps={steps.length}
      className="mb-4"
    />
  );
};
