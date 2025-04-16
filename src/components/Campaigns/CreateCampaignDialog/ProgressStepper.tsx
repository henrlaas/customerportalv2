
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  currentStep,
  totalSteps,
}) => {
  // Calculate progress percentage
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="space-y-2 mb-6">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Step {currentStep} of {totalSteps}</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};
