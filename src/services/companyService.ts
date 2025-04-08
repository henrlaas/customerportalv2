
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
    return data as Company[];
  },
  
  // Get companies filtered by type
  getCompaniesByType: async (type: string): Promise<Company[]> => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('client_type', type)
      .order('name');
    
    if (error) throw error;
    return data as Company[];
  },
  
  // Get a single company by id
  getCompany: async (id: string): Promise<Company> => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Company;
  },

  // Get child companies
  getChildCompanies: async (parentId: string): Promise<Company[]> => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('parent_id', parentId)
      .order('name');
    
    if (error) throw error;
    return data as Company[];
  },
  
  // Create company
  createCompany: async (company: Partial<Company> & { client_types?: string[] }): Promise<Company> => {
    // Ensure name field is provided as it's required by the database
    if (!company.name) {
      throw new Error('Company name is required');
    }
    
    // Handle conversion from client_types array to client_type string
    const companyData = { ...company };
    
    // If client_types exists, convert to a comma-separated string
    if ('client_types' in companyData) {
      const clientTypes = companyData.client_types;
      if (clientTypes && clientTypes.length > 0) {
        companyData.client_type = clientTypes.join(',');
      }
      delete companyData.client_types;
    }
    
    const { data, error } = await supabase
      .from('companies')
      .insert(companyData)
      .select()
      .single();
    
    if (error) throw error;
    return data as Company;
  },
  
  // Update company
  updateCompany: async (id: string, company: Partial<Company> & { client_types?: string[] }): Promise<Company> => {
    // Handle conversion from client_types array to client_type string
    const companyData = { ...company };
    
    // If client_types exists, convert to a comma-separated string
    if ('client_types' in companyData) {
      const clientTypes = companyData.client_types;
      if (clientTypes && clientTypes.length > 0) {
        companyData.client_type = clientTypes.join(',');
      }
      delete companyData.client_types;
    }
    
    const { data, error } = await supabase
      .from('companies')
      .update(companyData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Company;
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
      // Extract domain from website URL
      let domain = website;
      if (website.startsWith('http')) {
        const url = new URL(website);
        domain = url.hostname;
      }
      
      // Use Google's favicon service
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (error) {
      console.error('Error fetching favicon:', error);
      return null;
    }
  },
};
