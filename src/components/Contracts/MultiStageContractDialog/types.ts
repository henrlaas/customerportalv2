
export interface FormData {
  company: {
    id: string;
    name: string;
    organization_number?: string;
    street_address?: string;
    postal_code?: string;
    city?: string;
    country?: string;
    website?: string;
    logo_url?: string;
    mrr?: number;
  } | null;
  contact: {
    id: string;
    user_id: string;
    first_name?: string;
    last_name?: string;
    position?: string;
    avatar_url?: string;
  } | null;
  template: {
    id: string;
    name: string;
    type: string;
    content: string;
  } | null;
}
