
import { supabase } from '@/integrations/supabase/client';
import type { Company, CompanyContact } from '@/types/company';
import { formatCompanyResponse, prepareCompanyData } from './companyHelpers';

export const companyMutationService = {
  // Create company
  createCompany: async (company: Partial<Company> & { client_types?: string[] }): Promise<Company> => {
    // Ensure name field is provided as it's required by the database
    if (!company.name) {
      throw new Error('Company name is required');
    }
    
    // Format company data for submission
    const companyData = prepareCompanyData(company);
    
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
    
    return formatCompanyResponse(data) as Company;
  },
  
  // Update company
  updateCompany: async (id: string, company: Partial<Company> & { client_types?: string[] }): Promise<Company> => {
    // Format company data for submission
    const companyData = prepareCompanyData(company);
    
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
    
    return formatCompanyResponse(data) as Company;
  },
  
  // Delete company
  deleteCompany: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
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
};
