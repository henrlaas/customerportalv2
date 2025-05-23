import { createPDF } from '@/utils/pdfUtils';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export type ContractTemplate = {
  id: string;
  name: string;
  type: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type Contract = {
  id: string;
  company_id: string;
  contact_id: string;
  project_id: string | null;
  template_type: string;
  content: string;
  file_url: string | null;
  title: string | null;
  status: 'signed' | 'unsigned';
  signature_data: string | null;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export type ContractWithDetails = Contract & {
  company: { 
    name: string; 
    organization_number: string | null;
    address?: string | null;
    postal_code?: string | null;
    city?: string | null;
    country?: string | null;
    website?: string | null;
    logo_url?: string | null; // Ensure logo_url is included in the type
  };
  contact: { 
    id: string;
    user_id: string;
    position: string | null;
    email?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string | null;
  };
  creator?: { 
    first_name: string | null; 
    last_name: string | null;
    avatar_url?: string | null;
  } | null;
};

// Fetch templates
export async function fetchContractTemplates() {
  const { data, error } = await supabase
    .from('contract_templates')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as ContractTemplate[];
}

// Fetch a specific template
export async function fetchContractTemplate(id: string) {
  const { data, error } = await supabase
    .from('contract_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as ContractTemplate;
}

// Update a template
export async function updateContractTemplate(id: string, updates: Partial<ContractTemplate>) {
  const { data, error } = await supabase
    .from('contract_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ContractTemplate;
}

// Create a new template
export async function createContractTemplate(template: Omit<ContractTemplate, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('contract_templates')
    .insert(template)
    .select()
    .single();

  if (error) throw error;
  return data as ContractTemplate;
}

// Delete a template
export async function deleteContractTemplate(id: string) {
  const { data, error } = await supabase
    .from('contract_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Fetch contracts with company and contact details - optimized version
export async function fetchContracts() {
  console.time('fetchContracts');
  try {
    // Modified query to properly reference column names from the companies table
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        company:company_id (name, organization_number, address, postal_code, city, country, website, logo_url),
        contact:contact_id (id, user_id, position)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
    
    // Get user emails for contacts
    const contractsWithDetails = await enrichContractData(data || []);
    console.log('Contracts after enrichment:', contractsWithDetails); // Debug log
    
    return contractsWithDetails;
  } catch (err) {
    console.error('Error in fetchContracts:', err);
    throw err;
  } finally {
    console.timeEnd('fetchContracts');
  }
}

// Helper function to enrich contract data with user details - optimized version
async function enrichContractData(contracts: any[]): Promise<ContractWithDetails[]> {
  if (!contracts || contracts.length === 0) {
    return [];
  }
  
  console.time('enrichContractData');
  try {
    // Initialize each contract's properties to ensure they match ContractWithDetails type
    const initializedContracts = contracts.map(contract => {
      // Ensure company object exists with required properties
      if (!contract.company || typeof contract.company !== 'object') {
        contract.company = { name: 'Unknown', organization_number: null, website: null };
      }
      
      // Ensure contact object exists with required properties
      if (!contract.contact || typeof contract.contact !== 'object') {
        contract.contact = { id: '', user_id: '', position: null };
      }
      
      return contract;
    });
    
    // Get unique user IDs for contacts to prevent duplicate fetches
    const contactUserIds = Array.from(new Set(
      initializedContracts
        .map(contract => contract.contact?.user_id)
        .filter(Boolean)
    ));

    // Get unique creator IDs for later lookup
    const creatorIds = Array.from(new Set(
      initializedContracts
        .map(contract => contract.created_by)
        .filter(Boolean)
    ));
    
    if (contactUserIds.length > 0) {
      // Split into batches if there are many IDs to prevent query size issues
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < contactUserIds.length; i += batchSize) {
        batches.push(contactUserIds.slice(i, i + batchSize));
      }
      
      // Process in parallel for better performance
      const [emailsResults, profilesResults] = await Promise.all([
        // Process email batches
        Promise.all(batches.map(async batch => {
          const { data } = await supabase.functions.invoke('user-management', { 
            body: {
              action: 'list',
              userIds: batch
            }
          });
          return data || [];
        })),
        
        // Process profile batches
        Promise.all(batches.map(async batch => {
          const { data } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, avatar_url')
            .in('id', batch);
          return data || [];
        }))
      ]);
      
      // Flatten results
      const emailsData = emailsResults.flat();
      const profilesData = profilesResults.flat();
      
      // Create maps for faster lookups
      const emailMap = new Map(emailsData?.map((item: any) => [item.id, item.email]));
      const profileMap = new Map(profilesData?.map((item: any) => [item.id, item]));
      
      // Enrich each contract with additional data
      for (const contract of initializedContracts) {
        if (contract.contact?.user_id) {
          // Add email to contact if available
          if (emailMap.has(contract.contact.user_id)) {
            contract.contact.email = emailMap.get(contract.contact.user_id);
          }
          
          // Add first_name, last_name, and avatar_url to contact if available
          if (profileMap.has(contract.contact.user_id)) {
            const profile = profileMap.get(contract.contact.user_id);
            contract.contact.first_name = profile?.first_name;
            contract.contact.last_name = profile?.last_name;
            contract.contact.avatar_url = profile?.avatar_url;
          }
        }
      }
    }

    // If we have creator IDs, fetch their profile data separately
    if (creatorIds.length > 0) {
      const { data: creatorProfiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', creatorIds);
      
      if (creatorProfiles && creatorProfiles.length > 0) {
        const creatorMap = new Map(creatorProfiles.map(profile => [profile.id, profile]));
        
        // Add creator info to contracts
        for (const contract of initializedContracts) {
          if (contract.created_by && creatorMap.has(contract.created_by)) {
            contract.creator = creatorMap.get(contract.created_by) || null;
          }
        }
      }
    }
    
    return initializedContracts as ContractWithDetails[];
  } catch (err) {
    console.error("Error enriching contract data:", err);
    throw err;
  } finally {
    console.timeEnd('enrichContractData');
  }
}

// Fetch a specific contract
export async function fetchContract(id: string) {
  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      company:company_id (name, organization_number, address, postal_code, city, country, website, logo_url),
      contact:contact_id (id, user_id, position),
      creator:created_by (first_name, last_name, avatar_url)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  
  // Initialize contract with required properties
  const contract = data as any;
  
  // Ensure company object exists with required properties
  if (!contract.company || typeof contract.company !== 'object') {
    contract.company = { name: 'Unknown', organization_number: null, website: null };
  }
  
  // Ensure contact object exists with required properties
  if (!contract.contact || typeof contract.contact !== 'object') {
    contract.contact = { id: '', user_id: '', position: null };
  }
  
  // Enrich with contact details
  if (contract && contract.contact?.user_id) {
    try {
      // Get email for contact
      const { data: emailData } = await supabase.rpc('get_users_email', { 
        user_ids: [contract.contact.user_id] 
      });
      
      if (emailData && emailData[0]) {
        contract.contact.email = emailData[0].email;
      }
      
      // Get profile for contact
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', contract.contact.user_id)
        .single();
        
      if (profileData) {
        contract.contact.first_name = profileData.first_name;
        contract.contact.last_name = profileData.last_name;
        contract.contact.avatar_url = profileData.avatar_url;
      }
    } catch (err) {
      console.error("Error fetching contact details:", err);
    }
  }
  
  return contract as ContractWithDetails;
}

// Create a new contract
export async function createContract(contract: {
  company_id: string;
  contact_id: string;
  project_id?: string | null;
  template_type: string;
  content: string;
  title?: string;
  created_by?: string;
}) {
  const { data, error } = await supabase
    .from('contracts')
    .insert(contract)
    .select()
    .single();

  if (error) throw error;
  return data as Contract;
}

// Fetch contracts for a client (user logged in) - optimized version
export async function fetchClientContracts(userId: string) {
  console.time('fetchClientContracts');
  try {
    // Get all company contacts for this user
    const { data: contactsData, error: contactsError } = await supabase
      .from('company_contacts')
      .select('id, company_id')
      .eq('user_id', userId);

    if (contactsError) {
      throw contactsError;
    }
    
    if (!contactsData || contactsData.length === 0) {
      return [];
    }

    const contactIds = contactsData.map(contact => contact.id);
    
    // Get all contracts where this user is the contact
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        company:company_id (name),
        contact:contact_id (id, user_id, position)
      `)
      .in('contact_id', contactIds)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    
    // Enrich with additional data
    const contractsWithDetails = await enrichContractData(data || []);
    
    return contractsWithDetails;
  } catch (err) {
    console.error('Error in fetchClientContracts:', err);
    throw err;
  } finally {
    console.timeEnd('fetchClientContracts');
  }
}

// Sign a contract
export async function signContract(id: string, signatureData: string) {
  const { data, error } = await supabase
    .from('contracts')
    .update({
      status: 'signed',
      signature_data: signatureData,
      signed_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Contract;
}

// Replace placeholders in contract text with actual data
export function replacePlaceholders(text: string, data: Record<string, any>) {
  if (!text) return '';
  
  let processed = text;
  
  // Define all possible placeholders and their replacements
  const placeholders: Record<string, string | null> = {
    companyname: data.company?.name || null,
    organizationnumber: data.company?.organization_number || null,
    address: data.company?.street_address || null,
    zipcode: data.company?.postal_code || null,
    city: data.company?.city || null,
    country: data.company?.country || null,
    contactfullname: data.contact && (data.contact.first_name || data.contact.last_name) 
      ? `${data.contact.first_name || ''} ${data.contact.last_name || ''}`.trim()
      : null,
    contactposition: data.contact?.position || null,
    todaydate: format(new Date(), 'dd.MM.yyyy'),
    mrrprice: data.company?.mrr ? `${data.company.mrr} NOK` : null,
    description: data.project?.description || null,
    deadline: data.project?.deadline 
      ? format(new Date(data.project.deadline), 'dd.MM.yyyy')
      : null,
    price: data.project?.value ? `${data.project.value} NOK` : null
  };
  
  // Replace all placeholders with their values or remove them if null
  for (const [placeholder, value] of Object.entries(placeholders)) {
    const regex = new RegExp(`{{${placeholder}}}`, 'g');
    if (value === null) {
      // If the value is null, remove the placeholder entirely
      processed = processed.replace(regex, '');
    } else {
      // Otherwise replace with the value
      processed = processed.replace(regex, value);
    }
  }
  
  return processed;
}
