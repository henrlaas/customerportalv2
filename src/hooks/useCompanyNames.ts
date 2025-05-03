
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useCompanyNames = () => {
  return useQuery({
    queryKey: ['companyNames'],
    queryFn: async () => {
      try {
        const { data: companies, error } = await supabase
          .from('companies')
          .select('id, name')
          .order('name');
          
        if (error) {
          console.error('Error fetching company names:', error);
          toast({
            title: 'Error loading companies',
            description: 'Unable to retrieve company names. Please try again later.',
            variant: 'destructive',
          });
          throw error;
        }
        
        return companies || [];
      } catch (error) {
        console.error('Unexpected error in useCompanyNames:', error);
        throw error;
      }
    }
  });
};
