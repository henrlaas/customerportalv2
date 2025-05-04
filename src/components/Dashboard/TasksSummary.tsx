
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckSquare, AlertCircle } from 'lucide-react';

interface TasksSummaryProps {
  active: number;
  completed: number;
  overdue: number;
  isLoading: boolean;
}

export const TasksSummary: React.FC<TasksSummaryProps> = ({ 
  active, 
  completed, 
  overdue,
  isLoading 
}) => {
  const totalTasks = active + completed;
  const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;
  
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
              <CheckSquare className="h-4 w-4 mr-1" />
              <span className="text-sm">Active</span>
            </div>
            <span className="font-semibold text-primary">{active}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm">Completed</span>
            </div>
            <span className="font-semibold text-primary">{completed}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center text-red-500">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Overdue</span>
            </div>
            <span className="font-semibold text-red-500">{overdue}</span>
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Completion Rate</span>
              <span>{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </>
      )}
    </div>
  );
};
