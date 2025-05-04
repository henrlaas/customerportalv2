
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const DashboardCharts: React.FC = () => {
  // Sample data for charts
  const taskCompletionData = [
    { name: 'Week 1', completed: 12, overdue: 2 },
    { name: 'Week 2', completed: 19, overdue: 1 },
    { name: 'Week 3', completed: 15, overdue: 3 },
    { name: 'Week 4', completed: 22, overdue: 0 },
  ];

  const companySectorData = [
    { name: 'Technology', value: 35 },
    { name: 'E-commerce', value: 25 },
    { name: 'Healthcare', value: 20 },
    { name: 'Education', value: 15 },
    { name: 'Other', value: 5 },
  ];

  const COMPANY_COLORS = ['#004743', '#025955', '#0F7173', '#5FA39D', '#B5C9C8'];

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <Card className="bg-white border shadow-sm">
        <CardHeader>
          <CardTitle>Task Completion Rate</CardTitle>
          <CardDescription>Weekly completed vs. overdue tasks</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={taskCompletionData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" name="Completed Tasks" fill="#004743" />
              <Bar dataKey="overdue" name="Overdue Tasks" fill="#F97316" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-white border shadow-sm">
        <CardHeader>
          <CardTitle>Client Sectors</CardTitle>
          <CardDescription>Distribution of clients by industry</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={companySectorData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {companySectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COMPANY_COLORS[index % COMPANY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
