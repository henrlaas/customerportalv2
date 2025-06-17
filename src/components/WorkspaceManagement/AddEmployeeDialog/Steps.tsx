
import { ProgressStepper } from '@/components/ui/progress-stepper';

interface StepsProps {
  currentStep: number;
}

export function Steps({ currentStep }: StepsProps) {
  const steps = [
    'Basic Information',
    'Employment Details',
    'Payment Information'
  ];

  return <ProgressStepper currentStep={currentStep} totalSteps={steps.length} className="pb-4" />;
}
