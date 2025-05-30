
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
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

      // Prepare pie chart data
      const pieData = [];
      
      // Only add income if we have a project value
      if (projectValue) {
        pieData.push({
          name: "Income",
          value: projectValue,
          fill: "#22c55e"
        });
      }
      
      // Always add expenses
      pieData.push({
        name: "Expenses",
        value: totalCost,
        fill: "#ef4444"
      });

      return {
        pieData,
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
  if (!data?.pieData || data.pieData.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-md font-medium">
            <ChartLine className="h-4 w-4 mr-2 text-muted-foreground" />
            Project Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center p-6 text-muted-foreground text-sm">
          <p>No time entries found for this project.</p>
          <p>Financial data will be displayed once team members log time.</p>
        </CardContent>
      </Card>
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
              {formatCurrency(data.totalCost)}
            </div>
          </div>
          <div className={`bg-background rounded-md p-2 shadow-sm ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <div className="text-xs text-muted-foreground">Projected Profit</div>
            <div className="text-xl font-semibold">
              {formatCurrency(profit)} ({profitPercentage.toFixed(0)}%)
            </div>
          </div>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.pieData.map((entry, index) => (
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
