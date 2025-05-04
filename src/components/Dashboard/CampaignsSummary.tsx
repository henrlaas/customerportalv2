
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, ArrowUpRight } from 'lucide-react';

interface CampaignsSummaryProps {
  active: number;
  ready: number;
  inProgress: number;
  isLoading: boolean;
}

export const CampaignsSummary: React.FC<CampaignsSummaryProps> = ({ 
  active, 
  ready, 
  inProgress,
  isLoading 
}) => {
  const totalCampaigns = active + ready + inProgress;
  const readyPercentage = totalCampaigns > 0 ? Math.round((ready / totalCampaigns) * 100) : 0;
  
  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className="flex items-center text-gray-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span className="text-sm">Active</span>
            </div>
            <span className="font-semibold text-primary">{active}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center text-gray-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Ready</span>
            </div>
            <span className="font-semibold text-primary">{ready}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm">In Progress</span>
            </div>
            <span className="font-semibold text-primary">{inProgress}</span>
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Ready Rate</span>
              <span>{readyPercentage}%</span>
            </div>
            <Progress value={readyPercentage} className="h-2" />
          </div>
        </>
      )}
    </div>
  );
};
