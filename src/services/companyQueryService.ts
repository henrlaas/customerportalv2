
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
  
  // Get company contacts - Fixed query that doesn't rely on foreign key relationships
  getCompanyContacts: async (companyId: string) => {
    console.log(`Fetching contacts for company: ${companyId}`);
    
    // Modified query using explicit joins instead of relying on foreign key relationships
    const { data, error } = await supabase
      .from('company_contacts')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching company contacts:', error);
      throw error;
    }

    // Also fetch email addresses from auth.users using a separate query
    // because we can't directly join with auth.users
    const userIds = data.map(contact => contact.user_id);
    
    // Only fetch emails if we have contacts
    let emailsMap = {};
    if (userIds.length > 0) {
      const { data: authData, error: authError } = await supabase
        .rpc('get_users_email', { user_ids: userIds });
        
      if (!authError && authData) {
        emailsMap = authData.reduce((acc, item) => {
          acc[item.id] = item.email;
          return acc;
        }, {});
      } else if (authError) {
        console.warn('Could not fetch email addresses:', authError);
      }
    }

    // Log the number of contacts retrieved
    console.log(`Retrieved ${data?.length || 0} contacts for company ${companyId}`);

    // Process the nested data to flatten the structure and ensure type safety
    return data.map((item: any) => ({
      ...item,
      email: emailsMap[item.user_id] || '',
      first_name: item.profiles?.first_name || '',
      last_name: item.profiles?.last_name || '',
      avatar_url: item.profiles?.avatar_url || null,
    }));
  },
};
