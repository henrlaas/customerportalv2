
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface AdProgressStepperProps {
  currentStep: number;
  totalSteps: number;
}

export function AdProgressStepper({ currentStep, totalSteps }: AdProgressStepperProps) {
  // Calculate progress percentage
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="space-y-3 mb-6">
      <div className="flex justify-between text-sm">
        <motion.span 
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-muted-foreground font-medium"
        >
          Step {currentStep} of {totalSteps}
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-primary font-medium"
        >
          {Math.round(progress)}% Complete
        </motion.span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-primary/10">
        <motion.div 
          className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
