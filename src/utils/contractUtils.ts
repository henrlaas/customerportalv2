
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
  company: { name: string; organization_number: string | null };
  contact: { 
    id: string;
    user_id: string;
    position: string | null;
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  creator?: { first_name: string | null; last_name: string | null };
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

// Fetch contracts with company and contact details
export async function fetchContracts() {
  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      company:company_id (name, organization_number),
      contact:contact_id (id, user_id, position),
      creator:created_by (first_name, last_name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Get user emails for contacts
  const contactUserIds = data?.map(contract => contract.contact?.user_id).filter(Boolean);
  
  if (contactUserIds && contactUserIds.length > 0) {
    const { data: emailsData } = await supabase.rpc('get_users_email', { user_ids: contactUserIds });
    
    if (emailsData) {
      const emailMap = new Map(emailsData.map((item: any) => [item.id, item.email]));
      
      // Add email to contact data
      data.forEach((contract: any) => {
        if (contract.contact && contract.contact.user_id) {
          contract.contact.email = emailMap.get(contract.contact.user_id);
        }
      });
      
      // Get first and last names for contacts from profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', contactUserIds);
      
      if (profilesData) {
        const profileMap = new Map(profilesData.map((item: any) => [item.id, item]));
        
        data.forEach((contract: any) => {
          if (contract.contact && contract.contact.user_id) {
            const profile = profileMap.get(contract.contact.user_id);
            if (profile) {
              contract.contact.first_name = profile.first_name;
              contract.contact.last_name = profile.last_name;
            }
          }
        });
      }
    }
  }
  
  return data as ContractWithDetails[];
}

// Fetch a specific contract
export async function fetchContract(id: string) {
  const { data, error } = await supabase
    .from('contracts')
    .select(`
      *,
      company:company_id (name, organization_number, address, zipcode, city, country),
      contact:contact_id (id, user_id, position),
      creator:created_by (first_name, last_name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  
  // Get user email and profile for contact
  if (data.contact?.user_id) {
    const { data: emailData } = await supabase.rpc('get_users_email', { 
      user_ids: [data.contact.user_id] 
    });
    
    if (emailData && emailData[0]) {
      data.contact.email = emailData[0].email;
    }
    
    const { data: profileData } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', data.contact.user_id)
      .single();
      
    if (profileData) {
      data.contact.first_name = profileData.first_name;
      data.contact.last_name = profileData.last_name;
    }
  }
  
  return data as ContractWithDetails;
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

// Fetch contracts for a client (user logged in)
export async function fetchClientContracts(userId: string) {
  // Get all company contacts for this user
  const { data: contactsData, error: contactsError } = await supabase
    .from('company_contacts')
    .select('id, company_id')
    .eq('user_id', userId);

  if (contactsError) throw contactsError;
  
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

  if (error) throw error;
  return data as ContractWithDetails[];
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
  let processed = text;
  
  // Define all possible placeholders and their replacements
  const placeholders: Record<string, string | null> = {
    companyname: data.company?.name || '',
    organizationnumber: data.company?.organization_number || '',
    address: data.company?.address || '',
    zipcode: data.company?.zipcode || '',
    city: data.company?.city || '',
    country: data.company?.country || '',
    contactfullname: `${data.contact?.first_name || ''} ${data.contact?.last_name || ''}`.trim(),
    contactposition: data.contact?.position || '',
    todaydate: format(new Date(), 'dd.MM.yyyy'),
    mrrprice: data.company?.mrr ? `${data.company.mrr} NOK` : ''
  };
  
  // Replace all placeholders with their values
  for (const [placeholder, value] of Object.entries(placeholders)) {
    const regex = new RegExp(`{{${placeholder}}}`, 'g');
    processed = processed.replace(regex, value || '');
  }
  
  return processed;
}
