
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
      const query = supabase
        .from('companies')
        .select('id, name, parent_id');
      
      // Only get parent companies when not including subsidiaries
      if (!includeSubsidiaries) {
        query.is('parent_id', null);
      }
      
      query.order('name');
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data as Pick<Company, 'id' | 'name' | 'parent_id'>[];
    }
  });

  return {
    companies: data || [],
    isLoading,
    error
  };
};
