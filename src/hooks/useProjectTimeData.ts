
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProjectTimeData } from '@/types/project';

export const useProjectTimeData = (projectId: string) => {
  const {
    data: timeData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['project-time', projectId],
    queryFn: async () => {
      // Get all time entries for this project
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select(`
          *,
          employee:user_id(id, hourly_salary)
        `)
        .eq('project_id', projectId);

      if (timeError) throw timeError;

      if (!timeEntries || timeEntries.length === 0) {
        return {
          totalHours: 0,
          billableHours: 0,
          nonBillableHours: 0,
          profitability: {
            value: 0,
            cost: 0,
            profit: 0,
            profitMargin: 0
          }
        };
      }

      // Get project value
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('value')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      
      const projectValue = project?.value || 0;

      // Calculate hours and cost
      let totalHours = 0;
      let billableHours = 0;
      let nonBillableHours = 0;
      let totalCost = 0;

      timeEntries.forEach(entry => {
        if (!entry.end_time) return; // Skip running entries

        const startTime = new Date(entry.start_time);
        const endTime = new Date(entry.end_time);
        const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        
        // Default hourly rate if not found
        const hourlyRate = (entry.employee?.hourly_salary as number) || 500; 
        
        totalHours += hours;
        
        if (entry.is_billable) {
          billableHours += hours;
        } else {
          nonBillableHours += hours;
        }

        // Calculate cost based on employee's hourly rate
        totalCost += hours * hourlyRate;
      });

      // Calculate profitability metrics
      const profit = projectValue - totalCost;
      const profitMargin = projectValue > 0 ? (profit / projectValue) * 100 : 0;

      return {
        totalHours,
        billableHours,
        nonBillableHours,
        profitability: {
          value: projectValue,
          cost: totalCost,
          profit,
          profitMargin
        }
      };
    },
    enabled: !!projectId
  });

  return {
    timeData,
    isLoading,
    error
  };
};
