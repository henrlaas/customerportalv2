
import { ProgressStepper } from '@/components/ui/progress-stepper';

interface AdProgressStepperProps {
  currentStep: number;
  totalSteps: number;
}

export function AdProgressStepper({ currentStep, totalSteps }: AdProgressStepperProps) {
  return <ProgressStepper currentStep={currentStep} totalSteps={totalSteps} />;
}
