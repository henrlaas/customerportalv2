
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CircleDollarSign, ChevronDown, ChevronUp } from 'lucide-react';

interface DealsSummaryProps {
  total: number;
  open: number;
  value: number;
  isLoading: boolean;
}

export const DealsSummary: React.FC<DealsSummaryProps> = ({ 
  total, 
  open, 
  value,
  isLoading 
}) => {
  const closedDeals = total - open;
  const closedPercentage = total > 0 ? Math.round((closedDeals / total) * 100) : 0;
  
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
              <CircleDollarSign className="h-4 w-4 mr-1" />
              <span className="text-sm">Total Value</span>
            </div>
            <span className="font-semibold text-primary">${value.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center text-gray-600">
              <ChevronUp className="h-4 w-4 mr-1" />
              <span className="text-sm">Open Deals</span>
            </div>
            <span className="font-semibold text-primary">{open}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center text-gray-600">
              <ChevronDown className="h-4 w-4 mr-1" />
              <span className="text-sm">Closed Deals</span>
            </div>
            <span className="font-semibold text-primary">{closedDeals}</span>
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Close Rate</span>
              <span>{closedPercentage}%</span>
            </div>
            <Progress value={closedPercentage} className="h-2" />
          </div>
        </>
      )}
    </div>
  );
};
