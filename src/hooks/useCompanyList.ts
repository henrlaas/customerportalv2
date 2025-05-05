
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/company';

export const useCompanyList = (showSubsidiaries: boolean = false) => {
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companyList', { showSubsidiaries }],
    queryFn: async () => {
      let query = supabase.from('companies').select('*').order('name');

      // If not showing subsidiaries, only get parent companies
      if (!showSubsidiaries) {
        query = query.is('parent_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching companies:', error);
        throw error;
      }

      return data as Company[];
    },
  });

  return { companies, isLoading };
};
