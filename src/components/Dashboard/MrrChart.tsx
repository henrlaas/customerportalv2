
import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface MrrChartProps {
  isLoading: boolean;
}

// Generate synthetic MRR data for the past year
const generateMrrData = (companiesData: any[]) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const currentMonth = new Date().getMonth();
  const data = [];
  
  // Calculate baseline MRR from current companies
  let baseMrr = 0;
  companiesData?.forEach(company => {
    if (company.mrr && !isNaN(company.mrr)) {
      baseMrr += Number(company.mrr);
    }
  });
  
  // Generate data for the last 12 months
  for (let i = 11; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    
    // Create some variance in historic data (decreasing as we go back in time)
    const variance = i === 0 ? 1 : Math.max(0.7, 1 - (i * 0.03));
    const mrrValue = Math.round(baseMrr * variance);
    
    data.push({
      month: months[monthIndex],
      mrr: mrrValue,
    });
  }
  
  return data;
};

export const MrrChart: React.FC<MrrChartProps> = ({ isLoading }) => {
  const [mrrData, setMrrData] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data: companies, error } = await supabase
          .from('companies')
          .select('mrr');
        
        if (error) throw error;
        
        const generatedData = generateMrrData(companies || []);
        setMrrData(generatedData);
      } catch (error) {
        console.error('Error fetching company data for MRR chart:', error);
        // Generate some fallback data
        const fallbackData = generateMrrData([]);
        setMrrData(fallbackData);
      }
    };
    
    fetchCompanies();
  }, []);
  
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
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={mrrData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="month" />
          <YAxis 
            tickFormatter={(value) => `$${value.toLocaleString()}`} 
          />
          <Tooltip 
            formatter={(value: any) => [`$${value.toLocaleString()}`, 'MRR']} 
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="mrr" 
            name="Monthly Recurring Revenue" 
            stroke="#004743" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
