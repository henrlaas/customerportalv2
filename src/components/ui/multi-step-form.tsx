
import React, { useState } from 'react';

export interface Step {
  id: string;
  label: string;
}

export const useMultiStepForm = (steps: Step[]) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const nextStep = () => {
    setCurrentStepIndex(i => {
      if (i >= steps.length - 1) return i;
      return i + 1;
    });
  };

  const prevStep = () => {
    setCurrentStepIndex(i => {
      if (i <= 0) return i;
      return i - 1;
    });
  };

  const goToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  return {
    step: steps[currentStepIndex],
    steps,
    currentStepIndex,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === steps.length - 1,
    goToStep,
    nextStep,
    prevStep
  };
};
