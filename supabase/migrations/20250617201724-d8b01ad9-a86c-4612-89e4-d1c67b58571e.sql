
-- Create notification types enum
CREATE TYPE notification_type AS ENUM (
  'project_assigned',
  'deal_assigned', 
  'deal_stage_changed',
  'task_assigned',
  'contract_signed',
  'due_date_approaching',
  'campaign_comment_added',
  'campaign_approved',
  'campaign_rejected',
  'news_posted'
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  entity_type TEXT, -- 'project', 'deal', 'task', 'contract', 'campaign', 'news'
  entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification settings table
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS policies for notification settings
CREATE POLICY "Users can view their own notification settings" 
  ON public.notification_settings 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notification_settings_user_type ON public.notification_settings(user_id, notification_type);

-- Function to create a notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, entity_type, entity_id)
  VALUES (p_user_id, p_type, p_title, p_message, p_entity_type, p_entity_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Trigger function for project assignments
CREATE OR REPLACE FUNCTION notify_project_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_name TEXT;
BEGIN
  -- Get project name
  SELECT name INTO project_name FROM public.projects WHERE id = NEW.project_id;
  
  -- Create notification
  PERFORM public.create_notification(
    NEW.user_id,
    'project_assigned',
    'Assigned to Project',
    'You have been assigned to the project: ' || project_name,
    'project',
    NEW.project_id
  );
  
  RETURN NEW;
END;
$$;

-- Trigger function for task assignments
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  task_title TEXT;
BEGIN
  -- Get task title
  SELECT title INTO task_title FROM public.tasks WHERE id = NEW.task_id;
  
  -- Create notification
  PERFORM public.create_notification(
    NEW.user_id,
    'task_assigned',
    'New Task Assignment',
    'You have been assigned to the task: ' || task_title,
    'task',
    NEW.task_id
  );
  
  RETURN NEW;
END;
$$;

-- Trigger function for deal assignments
CREATE OR REPLACE FUNCTION notify_deal_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deal_title TEXT;
BEGIN
  -- Only notify if assigned_to is being set (not updated)
  IF OLD.assigned_to IS NULL AND NEW.assigned_to IS NOT NULL THEN
    -- Get deal title
    SELECT title INTO deal_title FROM public.deals WHERE id = NEW.id;
    
    -- Create notification
    PERFORM public.create_notification(
      NEW.assigned_to,
      'deal_assigned',
      'Deal Assignment',
      'You have been assigned to the deal: ' || deal_title,
      'deal',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger function for deal stage changes
CREATE OR REPLACE FUNCTION notify_deal_stage_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deal_title TEXT;
  stage_name TEXT;
BEGIN
  -- Only notify if stage changed and deal is assigned
  IF OLD.stage_id != NEW.stage_id AND NEW.assigned_to IS NOT NULL THEN
    -- Get deal title and new stage name
    SELECT d.title, ds.name INTO deal_title, stage_name 
    FROM public.deals d 
    JOIN public.deal_stages ds ON ds.id = NEW.stage_id 
    WHERE d.id = NEW.id;
    
    -- Create notification
    PERFORM public.create_notification(
      NEW.assigned_to,
      'deal_stage_changed',
      'Deal Stage Updated',
      'Deal "' || deal_title || '" moved to: ' || stage_name,
      'deal',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger function for contract status changes
CREATE OR REPLACE FUNCTION notify_contract_signed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  contract_title TEXT;
BEGIN
  -- Only notify if contract was signed and has a creator
  IF OLD.status != 'signed' AND NEW.status = 'signed' AND NEW.created_by IS NOT NULL THEN
    -- Get contract title
    SELECT title INTO contract_title FROM public.contracts WHERE id = NEW.id;
    
    -- Create notification
    PERFORM public.create_notification(
      NEW.created_by,
      'contract_signed',
      'Contract Signed',
      'Contract "' || COALESCE(contract_title, 'Untitled') || '" has been signed',
      'contract',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger function for news posts
CREATE OR REPLACE FUNCTION notify_news_posted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Notify all users except the creator
  FOR user_record IN 
    SELECT id FROM public.profiles WHERE id != NEW.created_by
  LOOP
    PERFORM public.create_notification(
      user_record.id,
      'news_posted',
      'New Announcement',
      'New news posted: ' || NEW.title,
      'news',
      NEW.id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER trigger_notify_project_assignment
  AFTER INSERT ON public.project_assignees
  FOR EACH ROW EXECUTE FUNCTION notify_project_assignment();

CREATE TRIGGER trigger_notify_task_assignment
  AFTER INSERT ON public.task_assignees
  FOR EACH ROW EXECUTE FUNCTION notify_task_assignment();

CREATE TRIGGER trigger_notify_deal_assignment
  AFTER UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION notify_deal_assignment();

CREATE TRIGGER trigger_notify_deal_stage_change
  AFTER UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION notify_deal_stage_change();

CREATE TRIGGER trigger_notify_contract_signed
  AFTER UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION notify_contract_signed();

CREATE TRIGGER trigger_notify_news_posted
  AFTER INSERT ON public.news
  FOR EACH ROW EXECUTE FUNCTION notify_news_posted();

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
