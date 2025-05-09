import { Database } from '@/integrations/supabase/types';

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  // Other profile fields as needed
};

export type PriceType = 'fixed' | 'estimated';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  value: number | null;
  price_type: PriceType | null;
  company_id: string;
  created_by: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithRelations extends Project {
  company?: any;
  creator?: Profile | null;
  assignees?: Profile[];
  milestones?: any[];
}
