
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
      console.log(`Fetching contacts for company: ${companyId}`);
      
      // First, get the company contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('company_contacts')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (contactsError) {
        console.error('Error fetching company contacts:', contactsError);
        throw new Error(contactsError.message);
      }

      if (!contactsData || contactsData.length === 0) {
        console.log('No contacts found for company:', companyId);
        return [];
      }

      // Extract user IDs to fetch profile data
      const userIds = contactsData.map(contact => contact.user_id);
      console.log('User IDs to fetch data for:', userIds);
      
      // Get profile data for these users including phone_number
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url, phone_number')
          .in('id', userIds);

        if (profilesError) {
          console.warn('Could not fetch profile information:', profilesError);
        } else if (profilesData) {
          // Create a map for quick lookups
          profilesMap = profilesData.reduce((acc: Record<string, any>, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});
          console.log('Profiles map:', profilesMap);
        }
      }

      // Get emails using the new dedicated edge function
      let emailsMap: Record<string, string> = {};
      if (userIds.length > 0) {
        try {
          console.log('Calling new get-user-emails function with user IDs:', userIds);
          const { data: emailsData, error: emailsError } = await supabase.functions.invoke('get-user-emails', {
            body: { userIds: userIds }
          });
          
          if (emailsError) {
            console.error('Error calling get-user-emails function:', emailsError);
          } else if (emailsData) {
            console.log('Email data from new function:', emailsData);
            // The function returns an array of {id, email} objects
            emailsMap = emailsData.reduce((acc: Record<string, string>, item: { id: string, email: string }) => {
              acc[item.id] = item.email;
              return acc;
            }, {});
            console.log('Emails map:', emailsMap);
          }
        } catch (error) {
          console.error('Error calling new get-user-emails function:', error);
        }
      }

      // Get verification status using the new function
      let verificationMap: Record<string, { is_verified: boolean; confirmed_at: string | null }> = {};
      if (userIds.length > 0) {
        try {
          console.log('Fetching verification status for user IDs:', userIds);
          const { data: verificationData, error: verificationError } = await supabase.rpc(
            'get_user_verification_status',
            { user_ids: userIds }
          );
          
          if (verificationError) {
            console.error('Error fetching verification status:', verificationError);
          } else if (verificationData) {
            console.log('Verification data:', verificationData);
            verificationMap = verificationData.reduce((acc: Record<string, any>, item: any) => {
              acc[item.user_id] = {
                is_verified: item.is_verified,
                confirmed_at: item.confirmed_at
              };
              return acc;
            }, {});
            console.log('Verification map:', verificationMap);
          }
        } catch (error) {
          console.error('Error calling get_user_verification_status function:', error);
        }
      }

      // Combine the data
      const combinedData = contactsData.map(contact => ({
        ...contact,
        email: emailsMap[contact.user_id] || '',
        first_name: profilesMap[contact.user_id]?.first_name || '',
        last_name: profilesMap[contact.user_id]?.last_name || '',
        avatar_url: profilesMap[contact.user_id]?.avatar_url || null,
        phone_number: profilesMap[contact.user_id]?.phone_number || null,
        is_verified: verificationMap[contact.user_id]?.is_verified || false,
        confirmed_at: verificationMap[contact.user_id]?.confirmed_at || null,
      }));

      console.log('Final combined contact data:', combinedData);
      return combinedData;
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
      
      // No more folder creation here - will be created on demand when files are uploaded
      
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
      // First fetch the favicon if website is provided
      let logoUrl = null;
      if (companyData.website) {
        logoUrl = await companyMutationService.fetchFavicon(companyData.website);
      }

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
      
      // If we have a logo URL, update the company with it in a separate call
      if (logoUrl) {
        const { error: logoError } = await supabase
          .from('companies')
          .update({ logo_url: logoUrl })
          .eq('id', companyId);
        
        if (logoError) {
          console.error("Error updating company logo:", logoError);
        }
      }
      
      // Now fetch the complete company data
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
