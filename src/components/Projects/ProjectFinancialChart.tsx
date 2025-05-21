
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
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
      if (!projectId) return { pieData: [], totalHours: 0, totalCost: 0 };

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

      // Always prepare pie chart data with at least two entries
      const pieData = [
        {
          name: "Income",
          value: projectValue || 0,
          fill: "#22c55e"
        },
        {
          name: "Expenses",
          value: totalCost || 0,
          fill: "#ef4444"
        }
      ];

      return {
        pieData,
        totalHours,
        totalCost
      };
    },
    enabled: !!projectId,
  });

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (error) {
    console.error('Error in financial chart:', error);
    return (
      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-md font-medium">
            <ChartLine className="h-4 w-4 mr-2 text-muted-foreground" />
            Project Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center p-6 text-muted-foreground text-sm">
          <p>Error loading financial data.</p>
          <p>Please try refreshing the page.</p>
        </CardContent>
      </Card>
    );
  }

  // Always ensure we have data to display
  const chartData = data?.pieData || [
    { name: "Income", value: projectValue || 0, fill: "#22c55e" },
    { name: "Expenses", value: 0, fill: "#ef4444" }
  ];

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Calculate project profit/loss
  const profit = (projectValue || 0) - (data?.totalCost || 0);
  const profitPercentage = projectValue && projectValue > 0 ? (profit / projectValue) * 100 : 0;

  // Prepare the colors for the pie chart
  const COLORS = ['#22c55e', '#ef4444'];

  return (
    <Card className="bg-muted/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-md font-medium">
          <ChartLine className="h-4 w-4 mr-2 text-muted-foreground" />
          Project Financial Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background rounded-md p-2 shadow-sm">
            <div className="text-xs text-muted-foreground">Project Value</div>
            <div className="text-xl font-semibold">
              {formatCurrency(projectValue || 0)}
            </div>
          </div>
          <div className="bg-background rounded-md p-2 shadow-sm">
            <div className="text-xs text-muted-foreground">Cost to Date</div>
            <div className="text-xl font-semibold">
              {formatCurrency(data?.totalCost || 0)}
            </div>
          </div>
          <div className={`bg-background rounded-md p-2 shadow-sm ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <div className="text-xs text-muted-foreground">Projected Profit</div>
            <div className="text-xl font-semibold">
              {formatCurrency(profit)} ({profitPercentage.toFixed(0)}%)
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({name, percent}) => {
                  // Only show label if percent is at least 1%
                  if (percent < 0.01) return null;
                  return `${name} ${(percent * 100).toFixed(0)}%`;
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
