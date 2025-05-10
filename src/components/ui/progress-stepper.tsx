
import React from 'react';

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function ProgressStepper({ 
  currentStep, 
  totalSteps,
  className = ""
}: ProgressStepperProps) {
  // Calculate progress percentage
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className={`space-y-1 mb-5 ${className}`}>
      {/* Simple step indicator text closer to the progress bar */}
      <p className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</p>
      
      {/* Enhanced Progress bar */}
      <div className="relative">
        {/* Glowing progress track */}
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
          {/* Glowing effect overlay */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-300/20 to-emerald-500/20" />
          </div>
          
          {/* Progress fill with animation */}
          <div className="relative">
            <div 
              className="h-3 bg-evergreen rounded-full transition-all duration-500 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Animated shine effect */}
              <div className="absolute top-0 left-0 right-0 bottom-0">
                <div className="absolute top-0 left-[-100%] h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shine_3s_ease-in-out_infinite]" />
              </div>
              
              {/* Subtle pulse glow effect */}
              <div className="absolute top-0 left-0 right-0 bottom-0 bg-evergreen/40 rounded-full animate-[pulse_2s_infinite] blur-sm -z-10 scale-105" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
