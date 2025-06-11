
import React from 'react';
import { Check } from 'lucide-react';

interface Stage {
  id: number;
  name: string;
}

interface ProgressStepperProps {
  stages: Stage[];
  currentStage: number;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ stages, currentStage }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      {stages.map((stage, index) => (
        <React.Fragment key={stage.id}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stage.id < currentStage
                  ? 'bg-green-600 text-white'
                  : stage.id === currentStage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {stage.id < currentStage ? (
                <Check className="w-4 h-4" />
              ) : (
                stage.id
              )}
            </div>
            <span className="text-xs mt-1 text-center max-w-[80px]">
              {stage.name}
            </span>
          </div>
          {index < stages.length - 1 && (
            <div
              className={`flex-1 h-px mx-2 ${
                stage.id < currentStage ? 'bg-green-600' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
