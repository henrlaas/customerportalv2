
import { Platform } from '../types/campaign';
import { AdFormStep } from './types/variations';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
        <div className="absolute top-4 left-0 w-full h-0.5 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 rounded-full"></div>
        <ol className="relative z-10 flex justify-between">
          {steps.map((step, index) => (
            <li key={index} className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Button
                  variant={currentStep === index ? "primary" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 w-8 rounded-full transition-all duration-300 press-effect",
                    currentStep === index && "bg-primary text-primary-foreground shadow-lg shadow-primary/20",
                    currentStep > index && "bg-primary/20 text-primary border-primary",
                    currentStep < index && "border-dashed"
                  )}
                  onClick={() => onStepChange(index)}
                >
                  <span className="text-sm font-medium">{index + 1}</span>
                </Button>
              </motion.div>
              {step.title && (
                <motion.span 
                  className="mt-2 text-sm hidden md:block"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                >
                  {step.title}
                </motion.span>
              )}
            </li>
          ))}
        </ol>
      </div>
      {steps[currentStep]?.description && (
        <motion.p 
          className="text-sm text-muted-foreground mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {steps[currentStep].description}
        </motion.p>
      )}
    </div>
  );
}
