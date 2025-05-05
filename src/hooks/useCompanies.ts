
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/company';

export type CompanyWithParentName = {
  id: string;
  name: string;
  parent_id: string | null;
  parent_name?: string;
};

export const useCompanies = (includeSubsidiaries: boolean = false) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['companies', { includeSubsidiaries }],
    queryFn: async () => {
      // If we need parent names, use a more complex query with a join
      if (includeSubsidiaries) {
        const query = supabase
          .from('companies')
          .select(`
            id, 
            name, 
            parent_id, 
            parent:companies!companies_parent_id_fkey (name)
          `);
        
        query.order('name');
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Transform the data to include parent_name
        return data.map(company => ({
          id: company.id,
          name: company.name,
          parent_id: company.parent_id,
          parent_name: company.parent?.name
        })) as CompanyWithParentName[];
      } else {
        // Simple query for parent companies only
        const query = supabase
          .from('companies')
          .select('id, name, parent_id')
          .is('parent_id', null)
          .order('name');
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Make sure we return objects with the correct shape
        return (data || []).map(item => ({
          id: item.id,
          name: item.name,
          parent_id: item.parent_id
        })) as CompanyWithParentName[];
      }
    }
  });

  return {
    companies: data || [],
    isLoading,
    error
  };
};
