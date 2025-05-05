
// Define Company type
export interface Company {
  id: string;
  name: string;
  organization_number?: string | null;
  logo_url?: string | null;
  website?: string | null;
  phone?: string | null;
  invoice_email?: string | null;
  street_address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  parent_id?: string | null;
  parent_name?: string | null;
  mrr?: number | null;
  trial_period?: boolean;
  is_partner?: boolean;
  is_marketing_client?: boolean;
  is_web_client?: boolean;
  advisor_id?: string | null;
  created_at?: string;
  updated_at?: string;
  // Add address as a virtual field that components are using
  address?: string | null;
}

export type CompanyContact = {
  id: string;
  company_id: string;
  user_id: string;
  position: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  is_admin: boolean;
  // Add avatar_url which is being used in CompanyContactsList
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
};
