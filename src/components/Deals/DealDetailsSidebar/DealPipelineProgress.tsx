
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Stage } from '../types/deal';
import { CheckCircle, Circle } from 'lucide-react';

interface DealPipelineProgressProps {
  currentStageId: string | null;
  stages: Stage[];
}

export const DealPipelineProgress: React.FC<DealPipelineProgressProps> = ({
  currentStageId,
  stages,
}) => {
  const sortedStages = [...stages].sort((a, b) => a.position - b.position);
  const currentStageIndex = sortedStages.findIndex(stage => stage.id === currentStageId);

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Deal Pipeline</h3>
        <div className="flex items-center justify-between">
          {sortedStages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const isLast = index === sortedStages.length - 1;
            
            return (
              <div key={stage.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${isCurrent ? 'bg-blue-500 border-blue-500 text-white' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-gray-100 border-gray-300 text-gray-400' : ''}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`
                    text-xs mt-2 text-center max-w-[80px] break-words
                    ${isCurrent ? 'font-medium text-blue-600' : ''}
                    ${isCompleted ? 'text-green-600' : ''}
                    ${!isCompleted && !isCurrent ? 'text-gray-500' : ''}
                  `}>
                    {stage.name}
                  </span>
                </div>
                
                {!isLast && (
                  <div className={`
                    w-12 h-0.5 mx-2 mt-4
                    ${index < currentStageIndex ? 'bg-green-500' : 'bg-gray-300'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
