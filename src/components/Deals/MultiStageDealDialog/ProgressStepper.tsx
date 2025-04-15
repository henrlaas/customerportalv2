
import React from 'react';
import { Circle, CircleCheck } from 'lucide-react';
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
    <div className="mb-8">
      <Progress value={progress} className="mb-4" />
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`flex flex-col items-center ${
              index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div className="mb-2">
              {index <= currentStepIndex ? (
                <CircleCheck className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </div>
            <span className="text-xs text-center max-w-[80px]">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
