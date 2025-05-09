
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ProjectTimeData = {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  projectValue: number;
  profitability: number | null;
  profitabilityPercentage: number | null;
};

export const useProjectTimeData = (projectId: string | null, projectValue: number = 0) => {
  const { profile } = useAuth();
  
  const { data: timeData, isLoading } = useQuery({
    queryKey: ['project-time-data', projectId],
    queryFn: async () => {
      if (!projectId) {
        return {
          totalHours: 0,
          billableHours: 0,
          nonBillableHours: 0,
          projectValue,
          profitability: null,
          profitabilityPercentage: null,
        } as ProjectTimeData;
      }

      // First fetch time entries for this project
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select(`
          id,
          start_time,
          end_time,
          is_billable,
          user_id,
          employee:user_id (
            hourly_salary
          )
        `)
        .eq('project_id', projectId)
        .not('end_time', 'is', null); // Using not is null instead of is not null for better TypeScript compatibility
      
      if (timeError) {
        console.error('Error fetching time entries:', timeError);
        throw timeError;
      }
      
      // Calculate hours and cost
      let totalHours = 0;
      let billableHours = 0;
      let nonBillableHours = 0;
      let totalCost = 0;
      
      for (const entry of timeEntries || []) {
        if (entry.start_time && entry.end_time) {
          const start = new Date(entry.start_time);
          const end = new Date(entry.end_time);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
          
          totalHours += hours;
          
          if (entry.is_billable) {
            billableHours += hours;
          } else {
            nonBillableHours += hours;
          }
          
          // Add to cost if we have hourly salary data
          // Safely check if employee data exists and has hourly_salary
          let employeeSalary = 0;
          
          if (entry.employee && 
              typeof entry.employee === 'object' && 
              'hourly_salary' in entry.employee) {
            employeeSalary = entry.employee.hourly_salary || 0;
          }
                              
          totalCost += hours * employeeSalary;
        }
      }
      
      // Calculate profitability (project value - cost)
      const profitability = projectValue - totalCost;
      const profitabilityPercentage = projectValue > 0 ? (profitability / projectValue) * 100 : null;
      
      return {
        totalHours,
        billableHours,
        nonBillableHours,
        projectValue,
        profitability,
        profitabilityPercentage
      } as ProjectTimeData;
    },
    enabled: !!profile
  });
  
  return {
    timeData: timeData || {
      totalHours: 0,
      billableHours: 0,
      nonBillableHours: 0,
      projectValue,
      profitability: null,
      profitabilityPercentage: null
    },
    isLoading
  };
};
