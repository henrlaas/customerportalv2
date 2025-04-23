
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCompanyNames = () => {
  return useQuery({
    queryKey: ['companyNames'],
    queryFn: async () => {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      
      return companies || [];
    }
  });
};
