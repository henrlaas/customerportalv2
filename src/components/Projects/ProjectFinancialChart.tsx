import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartLine } from 'lucide-react';

interface ProjectFinancialChartProps {
  projectId: string;
  projectValue: number | null;
}

export const ProjectFinancialChart = ({ projectId, projectValue = 0 }: ProjectFinancialChartProps) => {
  const [chartConfig] = useState({
    income: { label: 'Income', theme: { light: '#22c55e', dark: '#4ade80' } },
    outcome: { label: 'Expenses', theme: { light: '#ef4444', dark: '#f87171' } }
  });

  // Fetch project time entries along with employee hourly rates
  const { data, isLoading, error } = useQuery({
    queryKey: ['project-financial-data', projectId],
    queryFn: async () => {
      if (!projectId) return { timeEntries: [], totalHours: 0, totalCost: 0 };

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
      let chartData: any[] = [];
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

        // Group time entries by month for the chart
        const entriesByMonth: Record<string, { hours: number, cost: number }> = {};

        timeEntries.forEach(entry => {
          const startTime = new Date(entry.start_time);
          const endTime = entry.end_time ? new Date(entry.end_time) : new Date();
          const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          const month = format(startTime, 'MMM yyyy');
          const hourlyRate = hourlyRates[entry.user_id] || 0;
          const cost = hours * hourlyRate;

          totalHours += hours;
          totalCost += cost;

          if (!entriesByMonth[month]) {
            entriesByMonth[month] = { hours: 0, cost: 0 };
          }
          entriesByMonth[month].hours += hours;
          entriesByMonth[month].cost += cost;
        });

        // Convert to chart format
        chartData = Object.entries(entriesByMonth).map(([month, data]) => ({
          month,
          outcome: parseFloat(data.cost.toFixed(2)),
          income: projectValue ? parseFloat((projectValue / Object.keys(entriesByMonth).length).toFixed(2)) : 0,
        }));

        // Sort by date
        chartData.sort((a, b) => {
          return new Date(a.month).getTime() - new Date(b.month).getTime();
        });
      }

      return {
        chartData,
        totalHours,
        totalCost
      };
    },
    enabled: !!projectId,
  });

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  if (error) {
    return <p className="text-red-500">Error loading financial data</p>;
  }

  // If there are no time entries yet
  if (!data?.chartData || data.chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <div className="flex flex-col items-center gap-2 mb-4">
          <ChartLine className="h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-medium">Project Financial Overview</h3>
          <p className="text-muted-foreground">No time entries found for this project.</p>
          <p className="text-muted-foreground">Financial data will be displayed once team members log time.</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Calculate project profit/loss
  const profit = (projectValue || 0) - data.totalCost;
  const profitPercentage = projectValue ? (profit / projectValue) * 100 : 0;

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Project Financial Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background rounded-md p-4 shadow-sm">
            <div className="text-xs text-muted-foreground">Project Value</div>
            <div className="text-xl font-semibold">
              {formatCurrency(projectValue || 0)}
            </div>
          </div>
          <div className="bg-background rounded-md p-4 shadow-sm">
            <div className="text-xs text-muted-foreground">Cost to Date</div>
            <div className="text-xl font-semibold">
              {formatCurrency(data.totalCost)}
            </div>
          </div>
          <div className={`bg-background rounded-md p-4 shadow-sm ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <div className="text-xs text-muted-foreground">Projected Profit</div>
            <div className="text-xl font-semibold">
              {formatCurrency(profit)} ({profitPercentage.toFixed(0)}%)
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Monthly Income vs Expenses</h3>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="h-[300px] w-full">
            <ChartContainer config={chartConfig}>
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `${value > 1000 ? `${(value/1000).toFixed(0)}k` : value}`} 
                />
                <Tooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="var(--color-income)" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="outcome" 
                  stroke="var(--color-outcome)" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
