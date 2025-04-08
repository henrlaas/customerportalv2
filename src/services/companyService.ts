
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
  createCompany: async (company: Partial<Company>): Promise<Company> => {
    const { data, error } = await supabase
      .from('companies')
      .insert([company])
      .select()
      .single();
    
    if (error) throw error;
    return data as Company;
  },
  
  // Update company
  updateCompany: async (id: string, company: Partial<Company>): Promise<Company> => {
    const { data, error } = await supabase
      .from('companies')
      .update(company)
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

    // Flatten the nested structure
    return data.map(item => ({
      ...item,
      email: item.auth_user?.email,
      first_name: item.profile?.first_name,
      last_name: item.profile?.last_name,
      avatar_url: item.profile?.avatar_url,
    }));
  },

  // Add contact to company
  addCompanyContact: async (contact: Partial<CompanyContact>): Promise<CompanyContact> => {
    const { data, error } = await supabase
      .from('company_contacts')
      .insert([contact])
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
  }
};
