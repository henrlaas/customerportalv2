
import { Platform } from '../types/campaign';
import { AdFormStep } from './types/variations';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdVariationStepperProps {
  platform: Platform;
  currentStep: number;
  steps: AdFormStep[];
  onStepChange: (step: number) => void;
}

export function AdVariationStepper({
  platform,
  currentStep,
  steps,
  onStepChange
}: AdVariationStepperProps) {
  return (
    <div className="mb-8">
      <div className="relative">
        <div className="absolute top-4 left-0 w-full h-0.5 bg-muted"></div>
        <ol className="relative z-10 flex justify-between">
          {steps.map((step, index) => (
            <li key={index} className="flex flex-col items-center">
              <Button
                variant={currentStep === index ? "default" : "outline"}
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-full",
                  currentStep > index && "bg-primary text-primary-foreground"
                )}
                onClick={() => onStepChange(index)}
              >
                {index + 1}
              </Button>
              {step.title && (
                <span className="mt-2 text-sm hidden md:block">
                  {step.title}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
      {steps[currentStep]?.description && (
        <p className="text-sm text-muted-foreground mt-4">
          {steps[currentStep].description}
        </p>
      )}
    </div>
  );
}
