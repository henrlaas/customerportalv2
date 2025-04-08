
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
