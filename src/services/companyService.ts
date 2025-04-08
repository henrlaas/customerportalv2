
import { supabase } from '@/integrations/supabase/client';
import type { Company, CompanyContact } from '@/types/company';

export const companyService = {
  // Get all companies based on user's access
  getCompanies: async (): Promise<Company[]> => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    // Convert client_type string to array format for frontend
    return data.map(company => ({
      ...company,
      client_type: company.client_type || null
    })) as Company[];
  },
  
  // Get companies filtered by type
  getCompaniesByType: async (type: string): Promise<Company[]> => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .ilike('client_type', `%${type}%`)
      .order('name');
    
    if (error) throw error;
    
    // Convert client_type string to array format for frontend
    return data.map(company => ({
      ...company,
      client_type: company.client_type || null
    })) as Company[];
  },
  
  // Get a single company by id
  getCompany: async (id: string): Promise<Company> => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      client_type: data.client_type || null
    } as Company;
  },

  // Get child companies
  getChildCompanies: async (parentId: string): Promise<Company[]> => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('parent_id', parentId)
      .order('name');
    
    if (error) throw error;
    
    // Convert client_type string to array format for frontend
    return data.map(company => ({
      ...company,
      client_type: company.client_type || null
    })) as Company[];
  },
  
  // Create company
  createCompany: async (company: Partial<Company> & { client_types?: string[] }): Promise<Company> => {
    // Ensure name field is provided as it's required by the database
    if (!company.name) {
      throw new Error('Company name is required');
    }
    
    // Make a copy of the company data so we don't modify the original
    const companyData: any = { ...company };
    
    // Handle conversion from client_types array to client_type string
    if ('client_types' in companyData && companyData.client_types) {
      // Ensure we're passing a valid string for the client_type field in DB
      // We need to check the values to prevent constraint violation
      if (companyData.client_types.length === 1) {
        if (companyData.client_types[0] === 'Marketing') {
          companyData.client_type = 'Marketing';
        } else if (companyData.client_types[0] === 'Web') {
          companyData.client_type = 'Web';
        } else {
          companyData.client_type = companyData.client_types[0];
        }
      } else if (companyData.client_types.length > 1) {
        // For multiple values, we need to create a valid combination
        if (companyData.client_types.includes('Marketing') && companyData.client_types.includes('Web')) {
          companyData.client_type = 'Marketing,Web';
        } else {
          companyData.client_type = companyData.client_types.join(',');
        }
      } else {
        companyData.client_type = null; // Empty array case
      }
      
      // Remove client_types as it's not a DB field
      delete companyData.client_types;
    }
    
    console.log('Creating company with data:', companyData);
    
    const { data, error } = await supabase
      .from('companies')
      .insert(companyData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating company:', error);
      throw error;
    }
    
    return {
      ...data,
      client_type: data.client_type || null
    } as Company;
  },
  
  // Update company
  updateCompany: async (id: string, company: Partial<Company> & { client_types?: string[] }): Promise<Company> => {
    // Make a copy of the company data so we don't modify the original
    const companyData: any = { ...company };
    
    // Handle conversion from client_types array to client_type string
    if ('client_types' in companyData && companyData.client_types) {
      // Ensure we're passing a valid string for the client_type field in DB
      // We need to check the values to prevent constraint violation
      if (companyData.client_types.length === 1) {
        if (companyData.client_types[0] === 'Marketing') {
          companyData.client_type = 'Marketing';
        } else if (companyData.client_types[0] === 'Web') {
          companyData.client_type = 'Web';
        } else {
          companyData.client_type = companyData.client_types[0];
        }
      } else if (companyData.client_types.length > 1) {
        // For multiple values, we need to create a valid combination
        if (companyData.client_types.includes('Marketing') && companyData.client_types.includes('Web')) {
          companyData.client_type = 'Marketing,Web';
        } else {
          companyData.client_type = companyData.client_types.join(',');
        }
      } else {
        companyData.client_type = null; // Empty array case
      }
      
      // Remove client_types as it's not a DB field
      delete companyData.client_types;
    }
    
    const { data, error } = await supabase
      .from('companies')
      .update(companyData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating company:', error);
      throw error;
    }
    
    return {
      ...data,
      client_type: data.client_type || null
    } as Company;
  },
  
  // Delete company
  deleteCompany: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
  
  // Get company contacts
  getCompanyContacts: async (companyId: string): Promise<CompanyContact[]> => {
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
    })) as CompanyContact[];
  },

  // Add contact to company
  addCompanyContact: async (contact: Partial<CompanyContact>): Promise<CompanyContact> => {
    // Ensure required fields are present
    if (!contact.company_id || !contact.user_id) {
      throw new Error("Company ID and User ID are required");
    }
    
    // Create a properly typed object with required fields explicitly set
    const contactData = {
      company_id: contact.company_id,
      user_id: contact.user_id,
      position: contact.position,
      is_primary: contact.is_primary || false,
      is_admin: contact.is_admin || false,
    };
    
    const { data, error } = await supabase
      .from('company_contacts')
      .insert(contactData)
      .select()
      .single();
    
    if (error) throw error;
    return data as CompanyContact;
  },
  
  // Update company contact
  updateCompanyContact: async (id: string, contact: Partial<CompanyContact>): Promise<CompanyContact> => {
    const { data, error } = await supabase
      .from('company_contacts')
      .update(contact)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as CompanyContact;
  },
  
  // Delete company contact
  deleteCompanyContact: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('company_contacts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
  
  // Fetch website favicon
  fetchFavicon: async (website: string): Promise<string | null> => {
    try {
      // Check if website is empty or not a valid URL
      if (!website || !website.trim()) {
        return null;
      }
      
      // Extract domain from website URL
      let domain = website;
      
      // Make sure we have a valid URL by checking for protocol
      if (!website.startsWith('http://') && !website.startsWith('https://')) {
        domain = 'https://' + website;
      }
      
      try {
        const url = new URL(domain);
        domain = url.hostname;
      } catch (error) {
        console.error('Invalid URL:', domain);
        return null;
      }
      
      // Use Google's favicon service
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (error) {
      console.error('Error fetching favicon:', error);
      return null;
    }
  },
};
