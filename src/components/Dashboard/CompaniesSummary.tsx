
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CompaniesSummaryProps {
  total: number;
  marketing: number;
  web: number;
  isLoading: boolean;
}

export const CompaniesSummary: React.FC<CompaniesSummaryProps> = ({ 
  total, 
  marketing, 
  web,
  isLoading 
}) => {
  const data = [
    { name: 'Marketing Clients', value: marketing },
    { name: 'Web Development Clients', value: web },
    { name: 'Both Services', value: total - (marketing + web) }
  ];
  
  const COLORS = ['#004743', '#5FA39D', '#F2FCE2'];
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      {total === 0 ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-muted-foreground">No company data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius="70%"
              innerRadius="40%"
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} companies`, 'Count']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
