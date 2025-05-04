
// Company type matching our database schema
export type Company = {
  id: string;
  name: string;
  website: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  // New fields
  organization_number: string | null;
  invoice_email: string | null;
  street_address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  client_type: string | null; // Keeping for backward compatibility
  is_marketing_client: boolean; // New boolean field for marketing
  is_web_client: boolean; // New boolean field for web
  mrr: number | null;
  trial_period: boolean | null;
  is_partner: boolean | null;
  advisor_id: string | null;
  status?: 'active' | 'inactive'; // Added to fix CompaniesPage status property error
};

// Company contact type matching our database schema
export type CompanyContact = {
  id: string;
  company_id: string;
  user_id: string;
  position: string | null;
  is_primary: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  // Extended fields from profiles
  email?: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
};

