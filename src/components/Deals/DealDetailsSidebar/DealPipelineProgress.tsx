
import React from 'react';
import { Check } from 'lucide-react';
import { Stage, Deal } from '../types/deal';

interface DealPipelineProgressProps {
  deal: Deal;
  stages: Stage[];
}

export const DealPipelineProgress = ({ deal, stages }: DealPipelineProgressProps) => {
  const sortedStages = [...stages].sort((a, b) => a.position - b.position);
  const currentStageIndex = sortedStages.findIndex(stage => stage.id === deal.stage_id);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Deal Pipeline</h3>
        <span className="text-xs text-gray-500">
          Stage {currentStageIndex + 1} of {sortedStages.length}
        </span>
      </div>
      
      <div className="relative">
        {/* Progress Line Background */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200"></div>
        
        {/* Progress Line Active */}
        <div 
          className="absolute top-4 left-4 h-0.5 bg-blue-500 transition-all duration-300"
          style={{ 
            width: currentStageIndex >= 0 
              ? `${((currentStageIndex) / (sortedStages.length - 1)) * 100}%` 
              : '0%' 
          }}
        ></div>
        
        {/* Stage Dots */}
        <div className="relative flex justify-between">
          {sortedStages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isPending = index > currentStageIndex;
            
            return (
              <div key={stage.id} className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200
                  ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${isCurrent ? 'bg-blue-500 border-blue-500 text-white ring-4 ring-blue-100' : ''}
                  ${isPending ? 'bg-white border-gray-300 text-gray-400' : ''}
                `}>
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                
                <div className="mt-2 text-center max-w-16">
                  <span className={`
                    text-xs font-medium block leading-tight
                    ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'}
                  `}>
                    {stage.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
