
import { supabase } from '@/integrations/supabase/client';
import type { Company } from '@/types/company';
import { formatCompanyResponse } from './companyHelpers';

export const companyQueryService = {
  // Get all companies based on user's access
  getCompanies: async (): Promise<Company[]> => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    // Convert to proper format for frontend
    return data.map(company => formatCompanyResponse(company)) as Company[];
  },
  
  // Get companies filtered by type
  getCompaniesByType: async (type: string): Promise<Company[]> => {
    let query = supabase.from('companies').select('*');
    
    // Filter based on the type
    if (type === 'Marketing') {
      query = query.eq('is_marketing_client', true);
    } else if (type === 'Web') {
      query = query.eq('is_web_client', true);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) throw error;
    
    return data.map(company => formatCompanyResponse(company)) as Company[];
  },
  
  // Get a single company by id
  getCompany: async (id: string): Promise<Company> => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return formatCompanyResponse(data) as Company;
  },

  // Get child companies
  getChildCompanies: async (parentId: string): Promise<Company[]> => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('parent_id', parentId)
      .order('name');
    
    if (error) throw error;
    
    return data.map(company => formatCompanyResponse(company)) as Company[];
  },
  
  // Get company contacts
  getCompanyContacts: async (companyId: string) => {
    const { data, error } = await supabase
      .from('company_contacts')
      .select(`
        *,
        auth_user:user_id (
          email
        ),
        profile:user_id (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('company_id', companyId);
    
    if (error) throw error;

    // Process the nested data to flatten the structure and ensure type safety
    return data.map((item: any) => ({
      ...item,
      email: item.auth_user?.email || '',
      first_name: item.profile?.first_name || null,
      last_name: item.profile?.last_name || null,
      avatar_url: item.profile?.avatar_url || null,
    }));
  },
};
