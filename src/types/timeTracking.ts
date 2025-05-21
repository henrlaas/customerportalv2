
// Time entry type matching our database schema
export type TimeEntry = {
  id: string;
  user_id: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  task_id: string | null;
  created_at: string;
  updated_at: string;
  is_billable: boolean;
  company_id: string | null;
  campaign_id: string | null;
  project_id: string | null;
};

// Task type for selecting related tasks
export type Task = {
  id: string;
  title: string;
};

// Company type for selecting related companies
export type Company = {
  id: string;
  name: string;
};

// Campaign type for selecting related campaigns
export type Campaign = {
  id: string;
  name: string;
  company_id: string;
};

// Project type for selecting related projects
export type Project = {
  id: string;
  name: string;
  company_id: string;
};

// View type for toggling between list and calendar views
export type ViewType = "list" | "calendar";
