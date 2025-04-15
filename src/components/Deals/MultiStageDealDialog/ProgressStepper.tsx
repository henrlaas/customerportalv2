
import React from 'react';
import { Progress } from '@/components/ui/progress';

type Step = 'company-selection' | 'existing-company' | 'new-company' | 'contact-info' | 'deal-details';

interface ProgressStepperProps {
  currentStep: Step;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ currentStep }) => {
  const steps = [
    { id: 'company-selection', label: 'Company Type' },
    { id: 'existing-company', label: 'Company' },
    { id: 'contact-info', label: 'Contact' },
    { id: 'deal-details', label: 'Deal Details' },
  ];

  const getCurrentStepIndex = () => {
    if (currentStep === 'new-company') return 1; // Same position as 'existing-company'
    return steps.findIndex(step => step.id === currentStep);
  };

  const currentStepIndex = getCurrentStepIndex();
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2 text-sm text-muted-foreground">
        <span>Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex].label}</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};
