
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProjectFinanceCardProps {
  projectId: string;
  projectValue: number | null;
}

export const ProjectFinanceCard: React.FC<ProjectFinanceCardProps> = ({
  projectId,
  projectValue
}) => {
  const { data: financialData, isLoading } = useQuery({
    queryKey: ['project-financial-data', projectId],
    queryFn: async () => {
      if (!projectId) return { totalHours: 0, totalCost: 0 };

      // Get time entries for this project
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select(`
          id,
          start_time,
          end_time,
          user_id,
          is_billable
        `)
        .eq('project_id', projectId);

      if (timeError) {
        console.error('Error fetching time entries:', timeError);
        throw timeError;
      }

      // Calculate time spent and cost
      let totalCost = 0;
      let totalHours = 0;

      if (timeEntries && timeEntries.length > 0) {
        // Get all unique user IDs
        const userIds = [...new Set(timeEntries.map(entry => entry.user_id))];

        // Fetch employee data for these users to get hourly rates
        const { data: employees, error: empError } = await supabase
          .from('employees')
          .select('id, hourly_salary')
          .in('id', userIds);

        if (empError) {
          console.error('Error fetching employee data:', empError);
          throw empError;
        }

        // Create map of user_id to hourly_salary
        const hourlyRates: Record<string, number> = {};
        employees?.forEach(emp => {
          hourlyRates[emp.id] = emp.hourly_salary;
        });

        // Calculate total costs
        timeEntries.forEach(entry => {
          const startTime = new Date(entry.start_time);
          const endTime = entry.end_time ? new Date(entry.end_time) : new Date();
          const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          const hourlyRate = hourlyRates[entry.user_id] || 0;
          const cost = hours * hourlyRate;

          totalHours += hours;
          totalCost += cost;
        });
      }

      return {
        totalHours,
        totalCost
      };
    },
    enabled: !!projectId,
  });

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Not specified';
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const calculateProjectProfit = () => {
    const value = projectValue || 0;
    const totalCost = financialData?.totalCost || 0;
    const profit = value - totalCost;
    const profitPercentage = value ? (profit / value) * 100 : 0;
    
    return {
      profit,
      profitPercentage
    };
  };

  const { profit, profitPercentage } = calculateProjectProfit();
  const isProfit = profit >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Financial Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Project Value */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {formatCurrency(projectValue)}
            </div>
            <div className="text-sm text-blue-600 font-medium">Project Value</div>
          </div>
          
          {/* Cost to Date */}
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">
              {isLoading ? 'Loading...' : formatCurrency(financialData?.totalCost || 0)}
            </div>
            <div className="text-sm text-orange-600 font-medium">Cost to Date</div>
          </div>
          
          {/* Projected Profit */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`text-lg font-bold flex items-center justify-center gap-1 ${
              isProfit ? 'text-green-600' : 'text-red-600'
            }`}>
              {isProfit ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {isLoading ? 'Loading...' : formatCurrency(profit)}
            </div>
            <div className={`text-sm font-medium ${
              isProfit ? 'text-green-600' : 'text-red-600'
            }`}>
              Projected Profit ({profitPercentage.toFixed(0)}%)
            </div>
          </div>
        </div>
        
        {!isLoading && financialData && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Total hours logged: {financialData.totalHours.toFixed(1)}h
          </div>
        )}
      </CardContent>
    </Card>
  );
};
