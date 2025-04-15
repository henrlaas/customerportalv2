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
  
  // Get company contacts without relying on foreign key relationships
  getCompanyContacts: async (companyId: string) => {
    console.log(`Fetching contacts for company: ${companyId}`);
    
    // First, get the company contacts without trying to join with profiles
    const { data: contactsData, error: contactsError } = await supabase
      .from('company_contacts')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (contactsError) {
      console.error('Error fetching company contacts:', contactsError);
      throw contactsError;
    }

    // Extract user IDs to fetch profile data separately
    const userIds = contactsData.map(contact => contact.user_id);
    
    // Get profile data for these users
    let profilesMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.warn('Could not fetch profile information:', profilesError);
      } else if (profilesData) {
        // Create a map for quick lookups
        profilesMap = profilesData.reduce((acc: Record<string, any>, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
      }
    }

    // Get emails using the edge function
    let emailsMap: Record<string, string> = {};
    if (userIds.length > 0) {
      try {
        const { data: emailsData } = await supabase.functions.invoke('user-management', {
          body: {
            action: 'get-user-emails',
            userIds: userIds
          }
        });
        
        if (emailsData) {
          // Create a map for quick lookups
          emailsMap = emailsData.reduce((acc: Record<string, string>, item: { id: string, email: string }) => {
            acc[item.id] = item.email;
            return acc;
          }, {});
        }
      } catch (error) {
        console.error('Error invoking get-user-emails function:', error);
      }
    }

    // Combine the data
    return contactsData.map(contact => ({
      ...contact,
      email: emailsMap[contact.user_id] || '',
      first_name: profilesMap[contact.user_id]?.first_name || '',
      last_name: profilesMap[contact.user_id]?.last_name || '',
      avatar_url: profilesMap[contact.user_id]?.avatar_url || null,
    }));
  },
};
