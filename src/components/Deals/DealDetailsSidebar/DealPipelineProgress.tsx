
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Deal Pipeline</h3>
        <span className="text-sm text-gray-500">
          Stage {currentStageIndex >= 0 ? currentStageIndex + 1 : 1} of {sortedStages.length}
        </span>
      </div>
      
      <div className="relative">
        {/* Connecting Line Background */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2 mx-6"></div>
        
        {/* Progress Line */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-blue-500 transform -translate-y-1/2 transition-all duration-500 mx-6"
          style={{ 
            width: currentStageIndex >= 0 && sortedStages.length > 1
              ? `calc(${(currentStageIndex / (sortedStages.length - 1)) * 100}% - 12px)` 
              : '0%' 
          }}
        ></div>
        
        {/* Stage Circles */}
        <div className="relative flex justify-between items-center">
          {sortedStages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isPending = index > currentStageIndex;
            
            return (
              <div key={stage.id} className="flex flex-col items-center">
                {/* Stage Circle */}
                <div className={`
                  w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-sm relative z-10
                  ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${isCurrent ? 'bg-blue-500 border-blue-500 text-white ring-4 ring-blue-100' : ''}
                  ${isPending ? 'bg-white border-gray-300 text-gray-600' : ''}
                `}>
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                
                {/* Stage Name */}
                <div className="mt-3 text-center max-w-20">
                  <span className={`
                    text-xs font-medium block leading-tight
                    ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}
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
