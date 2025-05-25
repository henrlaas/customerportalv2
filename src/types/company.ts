
export interface Company {
  id: string;
  name: string;
  organization_number?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  client_type?: string;
  invoice_email?: string;
  is_marketing_client?: boolean;
  is_web_client?: boolean;
  parent_id?: string;
  advisor_id?: string;
  mrr?: number;
  trial_period?: boolean;
  is_partner?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyContact {
  id: string;
  company_id: string;
  user_id: string;
  position?: string;
  is_primary: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  // Profile data
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  phone_number?: string;
  // Verification status
  is_verified?: boolean;
  confirmed_at?: string | null;
}
