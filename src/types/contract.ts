
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
    user?: {
      profiles?: {
        first_name?: string;
        last_name?: string;
      }[];
    };
  };
  creators?: {
    profiles?: {
      first_name?: string;
      last_name?: string;
    }[];
  };
}
