
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
  is_running?: boolean;
};

// Task type for selecting related tasks
export type Task = {
  id: string;
  title: string;
};
