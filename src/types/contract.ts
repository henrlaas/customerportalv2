
export interface Contract {
  id: string;
  template_type: string;
  company_id: string;
  contact_id: string;
  project_id?: string;
  status: string;
  signed_at?: string;
  signature_data?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  file_url?: string;
  title?: string;
  companies?: {
    name?: string;
  };
  contacts?: {
    position?: string;
    user_id?: string;
    user?: {
      email?: string;
      id?: string;
      profiles?: Array<{
        first_name?: string;
        last_name?: string;
      }>;
    };
  };
  creators?: {
    email?: string;
    profiles?: Array<{
      first_name?: string;
      last_name?: string;
    }>;
  };
}
