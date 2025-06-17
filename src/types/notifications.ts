
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
  | 'news_posted';

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
