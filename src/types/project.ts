
import { Company } from './company';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone_number?: string | null;
  role?: string;
  team?: string | null;
  language?: string;
  is_client?: boolean;
}

export type PriceType = 'fixed' | 'estimated';

export type MilestoneStatus = 'created' | 'completed';

export interface Project {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  value: number | null;
  price_type: PriceType | null;
  deadline: string | null; // ISO string
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithRelations extends Project {
  company?: Company;
  creator?: Profile;
  assignees?: Profile[];
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  status: MilestoneStatus;
  due_date: string | null; // ISO string
  created_at: string;
  updated_at: string;
}

export interface ProjectAssignee {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
}

export interface ProjectTimeData {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  profitability?: number; // calculated field (project value - (billableHours * hourlyRate))
}
