
import { Progress } from '@/components/ui/progress';

interface AdProgressStepperProps {
  currentStep: number;
  totalSteps: number;
}

export function AdProgressStepper({ currentStep, totalSteps }: AdProgressStepperProps) {
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
}
