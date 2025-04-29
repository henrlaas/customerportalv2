
import React from 'react';
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol role="list" className="flex items-center">
        {steps.map((step, index) => (
          <li 
            key={step.id} 
            className={cn(
              index > 0 ? "flex-1" : "", 
              "relative"
            )}
          >
            {index < currentStep ? (
              // Completed step
              <div className="group flex items-center">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary rounded-full">
                  <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                </span>
                <span className="ml-3 text-sm font-medium text-primary">
                  {step.label}
                </span>
              </div>
            ) : index === currentStep ? (
              // Current step
              <div className="flex items-center" aria-current="step">
                <span
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 border-primary rounded-full"
                >
                  <span className="text-primary font-semibold">{index + 1}</span>
                </span>
                <span className="ml-3 text-sm font-medium text-primary">
                  {step.label}
                </span>
              </div>
            ) : (
              // Upcoming step
              <div className="flex items-center">
                <span
                  className="flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 border-gray-300 dark:border-gray-700 rounded-full"
                >
                  <span className="text-gray-500 dark:text-gray-400">{index + 1}</span>
                </span>
                <span className="ml-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {step.label}
                </span>
              </div>
            )}
            
            {index < steps.length - 1 && (
              <div className={cn(
                index < currentStep ? "border-primary" : "border-gray-300 dark:border-gray-700",
                "hidden sm:block absolute top-4 -right-4 left-0 h-0.5 border-t-2"
              )} />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
