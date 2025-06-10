
import React from 'react';
import { Check, X } from 'lucide-react';
import { Stage, Deal } from '../types/deal';

interface DealPipelineProgressProps {
  deal: Deal;
  stages: Stage[];
}

export const DealPipelineProgress = ({ deal, stages }: DealPipelineProgressProps) => {
  if (!stages || stages.length === 0) {
    return (
      <div className="space-y-4">
        <span className="text-sm text-gray-500">Loading stages...</span>
      </div>
    );
  }

  // Special stage IDs
  const CLOSED_WON_ID = '338e9b9c-bdd6-4ffb-8543-83cbeab7a7ae';
  const CLOSED_LOST_ID = 'f276a956-5c5e-434f-ac30-8c1306d1a65e';

  // Filter stages based on current deal stage
  const getFilteredStages = () => {
    const sortedStages = [...stages].sort((a, b) => a.position - b.position);
    
    if (deal.stage_id === CLOSED_WON_ID) {
      // If deal is won, exclude the "Closed Lost" stage
      return sortedStages.filter(stage => stage.id !== CLOSED_LOST_ID);
    }
    
    // For all other cases (including Closed Lost), show all stages
    return sortedStages;
  };

  const filteredStages = getFilteredStages();
  const currentStageIndex = filteredStages.findIndex(stage => stage.id === deal.stage_id);

  const getStageIcon = (stage: Stage, index: number) => {
    const isCompleted = index < currentStageIndex;
    const isCurrent = index === currentStageIndex;
    
    // Special handling for Closed Won when deal is Closed Lost
    if (stage.id === CLOSED_WON_ID && deal.stage_id === CLOSED_LOST_ID) {
      return <X className="h-5 w-5" />;
    }
    
    // Special handling for final stages when they are current or completed
    if (stage.id === CLOSED_WON_ID && (isCompleted || isCurrent)) {
      return <span className="text-lg">🎉</span>;
    }
    
    if (stage.id === CLOSED_LOST_ID && (isCompleted || isCurrent)) {
      return <span className="text-lg">😔</span>;
    }
    
    // Default icons
    if (isCompleted) {
      return <Check className="h-5 w-5" />;
    }
    
    return <span className="text-sm font-semibold">{index + 1}</span>;
  };

  const getStageCircleStyle = (stage: Stage, index: number) => {
    const isCompleted = index < currentStageIndex;
    const isCurrent = index === currentStageIndex;
    
    // Special styling for Closed Won when deal is Closed Lost (red cross)
    if (stage.id === CLOSED_WON_ID && deal.stage_id === CLOSED_LOST_ID) {
      return 'w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-sm relative z-10 bg-red-500 border-red-500 text-white';
    }
    
    // Special styling for Closed Lost
    if (stage.id === CLOSED_LOST_ID && (isCompleted || isCurrent)) {
      return `w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-sm relative z-10 bg-red-500 border-red-500 text-white ${isCurrent ? 'ring-4 ring-red-100' : ''}`;
    }
    
    // Special styling for Closed Won
    if (stage.id === CLOSED_WON_ID && (isCompleted || isCurrent)) {
      return `w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-sm relative z-10 bg-green-500 border-green-500 text-white ${isCurrent ? 'ring-4 ring-green-100' : ''}`;
    }
    
    // Default styling
    if (isCompleted) {
      return 'w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-sm relative z-10 bg-green-500 border-green-500 text-white';
    }
    
    if (isCurrent) {
      return 'w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-sm relative z-10 bg-blue-500 border-blue-500 text-white ring-4 ring-blue-100';
    }
    
    return 'w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-sm relative z-10 bg-white border-gray-300 text-gray-600';
  };

  return (
    <div className="relative px-6">
      {/* Connecting Line Background */}
      <div className="absolute top-6 left-12 right-12 h-0.5 bg-gray-200"></div>
      
      {/* Progress Line */}
      <div 
        className="absolute top-6 left-12 h-0.5 bg-blue-500 transition-all duration-500"
        style={{ 
          width: currentStageIndex >= 0 && filteredStages.length > 1
            ? `${(currentStageIndex / (filteredStages.length - 1)) * (100 - (12 * 2 / (100 / 100)))}%`
            : '0%' 
        }}
      ></div>
      
      {/* Stage Circles */}
      <div className="relative flex justify-between items-center">
        {filteredStages.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          
          return (
            <div key={stage.id} className="flex flex-col items-center">
              {/* Stage Circle */}
              <div className={getStageCircleStyle(stage, index)}>
                {getStageIcon(stage, index)}
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
  );
};
