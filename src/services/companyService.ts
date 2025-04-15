import { supabase } from '@/integrations/supabase/client';
import { Company, CompanyContact } from '@/types/company';

const companyQueryService = {
  fetchCompanies: async (): Promise<Company[]> => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching companies:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      console.error('Unexpected error fetching companies:', error);
      throw error;
    }
  },

  fetchChildCompanies: async (parentId: string): Promise<Company[]> => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('parent_id', parentId)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching child companies:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      console.error('Unexpected error fetching child companies:', error);
      throw error;
    }
  },

  fetchCompanyById: async (id: string): Promise<Company | null> => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching company by ID:', error);
        throw new Error(error.message);
      }

      return data || null;
    } catch (error: any) {
      console.error('Unexpected error fetching company by ID:', error);
      throw error;
    }
  },

  fetchCompanyContacts: async (companyId: string): Promise<CompanyContact[]> => {
    try {
      const { data, error } = await supabase
        .from('company_contacts')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching company contacts:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      console.error('Unexpected error fetching company contacts:', error);
      throw error;
    }
  },
};

const companyMutationService = {
  createCompany: async (companyData: Partial<Company> & { client_types?: string[] } & { name: string }): Promise<Company> => {
    try {
      // Ensure name field is provided as it's required by the database
      if (!companyData.name) {
        throw new Error('Company name is required');
      }
      
      // Format the client_types to boolean values if they are present
      const formattedCompanyData: any = { ...companyData };
      
      if (companyData.client_types) {
        formattedCompanyData.is_marketing_client = companyData.client_types.includes('Marketing');
        formattedCompanyData.is_web_client = companyData.client_types.includes('Web');
        delete formattedCompanyData.client_types; // Remove client_types as it's not a column
      }
      
      const { data, error } = await supabase
        .from('companies')
        .insert(formattedCompanyData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating company:', error);
        throw error;
      }
      
      return data as Company;
    } catch (error: any) {
      console.error('Unexpected error creating company:', error);
      throw error;
    }
  },

  updateCompany: async (id: string, company: Partial<Company> & { client_types?: string[] }): Promise<Company> => {
    try {
      // Format the client_types to boolean values if they are present
      const formattedCompanyData: any = { ...company };
      
      if (company.client_types) {
        formattedCompanyData.is_marketing_client = company.client_types.includes('Marketing');
        formattedCompanyData.is_web_client = company.client_types.includes('Web');
        delete formattedCompanyData.client_types; // Remove client_types as it's not a column
      }
      
      const { data, error } = await supabase
        .from('companies')
        .update(formattedCompanyData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating company:', error);
        throw error;
      }
      
      return data as Company;
    } catch (error: any) {
      console.error('Unexpected error updating company:', error);
      throw error;
    }
  },
  
  deleteCompany: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting company:', error);
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Unexpected error deleting company:', error);
      throw error;
    }
  },

  createContact: async (contact: { company_id: string; user_id: string; position?: string; is_primary?: boolean; is_admin?: boolean }): Promise<CompanyContact> => {
    try {
      // Ensure required fields are present
      if (!contact.company_id || !contact.user_id) {
        throw new Error("Company ID and User ID are required");
      }
      
      const { data, error } = await supabase
        .from('company_contacts')
        .insert(contact)
        .select()
        .single();
      
      if (error) throw error;
      return data as CompanyContact;
    } catch (error: any) {
      console.error('Unexpected error creating contact:', error);
      throw error;
    }
  },

  updateContact: async (id: string, updates: Partial<CompanyContact>): Promise<CompanyContact | null> => {
    try {
      const { data, error } = await supabase
        .from('company_contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating contact:', error);
        throw new Error(error.message);
      }

      return data || null;
    } catch (error: any) {
      console.error('Unexpected error updating contact:', error);
      throw error;
    }
  },

  deleteContact: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('company_contacts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting contact:', error);
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Unexpected error deleting contact:', error);
      throw error;
    }
  },
  
  fetchFavicon: async (website: string) => {
    if (!website) return null;
    
    try {
      // Clean up the URL to ensure it's valid
      let url = website.trim();
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      
      // Extract domain
      const domain = new URL(url).hostname;
      
      // Return Google's favicon service URL
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (error) {
      console.error('Error formatting favicon URL:', error);
      return null;
    }
  },
  
  // Add method for temp company conversion - fixed to return Company type
  convertTempCompany: async (companyData: any, dealId: string): Promise<Company> => {
    try {
      const { data, error } = await supabase.rpc('convert_temp_deal_company', {
        deal_id_param: dealId,
        name_param: companyData.name,
        organization_number_param: companyData.organization_number || null,
        is_marketing_param: companyData.client_types?.includes('Marketing') || false,
        is_web_param: companyData.client_types?.includes('Web') || false,
        website_param: companyData.website || null,
        phone_param: companyData.phone || null,
        invoice_email_param: companyData.invoice_email || null,
        street_address_param: companyData.street_address || null,
        city_param: companyData.city || null,
        postal_code_param: companyData.postal_code || null,
        country_param: companyData.country || null,
        advisor_id_param: companyData.advisor_id || null,
        mrr_param: companyData.mrr || 0,
        trial_period_param: companyData.trial_period || false,
        is_partner_param: companyData.is_partner || false,
        created_by_param: null // The RPC function will use auth.uid() internally
      });
      
      if (error) throw new Error(error.message);
      
      // Fetch the created company by the returned ID to make sure we return a Company object
      const companyId = data as string;
      const { data: companyData2, error: error2 } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
        
      if (error2) throw new Error(error2.message);
      return companyData2 as Company;
    } catch (error) {
      console.error("Error converting temporary company:", error);
      throw error;
    }
  }
};

export const companyService = {
  // Query functions
  fetchCompanies: companyQueryService.fetchCompanies,
  fetchChildCompanies: companyQueryService.fetchChildCompanies,
  fetchCompanyById: companyQueryService.fetchCompanyById,
  fetchCompanyContacts: companyQueryService.fetchCompanyContacts,
  
  // Mutation functions
  createCompany: companyMutationService.createCompany,
  updateCompany: companyMutationService.updateCompany,
  deleteCompany: companyMutationService.deleteCompany,
  createContact: companyMutationService.createContact,
  updateContact: companyMutationService.updateContact,
  deleteContact: companyMutationService.deleteContact,
  fetchFavicon: companyMutationService.fetchFavicon,
  convertTempCompany: companyMutationService.convertTempCompany,
};
