
import { ProgressStepper as BaseProgressStepper } from '@/components/ui/progress-stepper';

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <BaseProgressStepper currentStep={currentStep} totalSteps={totalSteps} />
  );
};
