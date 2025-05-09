
export interface Project {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  value?: number;
  price_type?: 'fixed' | 'estimated';
  deadline?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  status: MilestoneStatus;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export type MilestoneStatus = 'created' | 'completed';

export interface ProjectTimeData {
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  profitability?: {
    value: number;
    cost: number;
    profit: number;
    profitMargin: number;
  };
}

export interface ProjectAssignee {
  id: string;
  project_id: string;
  user_id: string;
  created_at: string;
}

export interface User {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role?: string;
}
