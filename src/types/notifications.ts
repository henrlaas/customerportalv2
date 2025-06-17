
export type NotificationType = 
  | 'project_assigned'
  | 'deal_assigned' 
  | 'deal_stage_changed'
  | 'task_assigned'
  | 'contract_signed'
  | 'due_date_approaching'
  | 'campaign_comment_added'
  | 'campaign_approved'
  | 'campaign_rejected'
  | 'news_posted'
  | 'project_completed'
  | 'task_completed'
  | 'company_advisor_assigned'
  | 'campaign_assigned'
  | 'campaign_status_changed'
  | 'deal_won'
  | 'role_changed'
  | 'monthly_time_reminder'
  | 'contract_signature_reminder'
  | 'milestone_created'
  | 'project_deadline_approaching'
  | 'task_overdue'
  | 'weekly_progress_report'
  | 'monthly_progress_report'
  | 'file_uploaded_to_project'
  | 'meeting_deadline_conflict';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  entity_type?: string;
  entity_id?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  enabled: boolean;
  email_enabled: boolean;
  created_at: string;
  updated_at: string;
}
