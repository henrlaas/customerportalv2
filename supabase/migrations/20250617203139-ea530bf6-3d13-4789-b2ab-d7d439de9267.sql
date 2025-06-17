
-- Expand notification_type enum with all new notification types
ALTER TYPE notification_type ADD VALUE 'project_completed';
ALTER TYPE notification_type ADD VALUE 'task_completed';
ALTER TYPE notification_type ADD VALUE 'company_advisor_assigned';
ALTER TYPE notification_type ADD VALUE 'campaign_assigned';
ALTER TYPE notification_type ADD VALUE 'campaign_status_changed';
ALTER TYPE notification_type ADD VALUE 'deal_won';
ALTER TYPE notification_type ADD VALUE 'role_changed';
ALTER TYPE notification_type ADD VALUE 'monthly_time_reminder';
ALTER TYPE notification_type ADD VALUE 'contract_signature_reminder';
ALTER TYPE notification_type ADD VALUE 'milestone_created';
ALTER TYPE notification_type ADD VALUE 'project_deadline_approaching';
ALTER TYPE notification_type ADD VALUE 'task_overdue';
ALTER TYPE notification_type ADD VALUE 'weekly_progress_report';
ALTER TYPE notification_type ADD VALUE 'monthly_progress_report';
ALTER TYPE notification_type ADD VALUE 'file_uploaded_to_project';
ALTER TYPE notification_type ADD VALUE 'meeting_deadline_conflict';

-- Create campaign_assignees table to track campaign assignments
CREATE TABLE public.campaign_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, user_id)
);

-- Enable RLS on campaign_assignees
ALTER TABLE public.campaign_assignees ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_assignees
CREATE POLICY "Users can view campaign assignments they have access to" 
  ON public.campaign_assignees 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
  );

CREATE POLICY "Admins and employees can manage campaign assignments" 
  ON public.campaign_assignees 
  FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'employee')));

-- Create indexes for performance
CREATE INDEX idx_campaign_assignees_campaign_id ON public.campaign_assignees(campaign_id);
CREATE INDEX idx_campaign_assignees_user_id ON public.campaign_assignees(user_id);

-- Update existing trigger functions to prevent self-notifications

-- Update project assignment notification function
CREATE OR REPLACE FUNCTION notify_project_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_name TEXT;
  assigner_id UUID;
BEGIN
  -- Get the current user (who is making the assignment)
  assigner_id := auth.uid();
  
  -- Only notify if the assigner is different from the assignee
  IF assigner_id IS NULL OR assigner_id != NEW.user_id THEN
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
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update task assignment notification function
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  task_title TEXT;
  assigner_id UUID;
BEGIN
  -- Get the current user (who is making the assignment)
  assigner_id := auth.uid();
  
  -- Only notify if the assigner is different from the assignee
  IF assigner_id IS NULL OR assigner_id != NEW.user_id THEN
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
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update deal assignment notification function
CREATE OR REPLACE FUNCTION notify_deal_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deal_title TEXT;
  assigner_id UUID;
BEGIN
  -- Get the current user (who is making the assignment)
  assigner_id := auth.uid();
  
  -- Only notify if assigned_to is being set (not updated) and assigner is different from assignee
  IF OLD.assigned_to IS NULL AND NEW.assigned_to IS NOT NULL AND 
     (assigner_id IS NULL OR assigner_id != NEW.assigned_to) THEN
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

-- Enhanced deal stage change notification function
CREATE OR REPLACE FUNCTION notify_deal_stage_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deal_title TEXT;
  stage_name TEXT;
  changer_id UUID;
BEGIN
  -- Get the current user (who is making the change)
  changer_id := auth.uid();
  
  -- Only notify if stage changed, deal is assigned, and changer is different from assignee
  IF OLD.stage_id != NEW.stage_id AND NEW.assigned_to IS NOT NULL AND 
     (changer_id IS NULL OR changer_id != NEW.assigned_to) THEN
    -- Get deal title and new stage name
    SELECT d.title, ds.name INTO deal_title, stage_name 
    FROM public.deals d 
    JOIN public.deal_stages ds ON ds.id = NEW.stage_id 
    WHERE d.id = NEW.id;
    
    -- Check if this is a "Closed Won" stage for special notification
    IF stage_name = 'Closed Won' THEN
      PERFORM public.create_notification(
        NEW.assigned_to,
        'deal_won',
        'Deal Won! 🎉',
        'Congratulations! Deal "' || deal_title || '" has been won!',
        'deal',
        NEW.id
      );
    ELSE
      -- Regular stage change notification
      PERFORM public.create_notification(
        NEW.assigned_to,
        'deal_stage_changed',
        'Deal Stage Updated',
        'Deal "' || deal_title || '" moved to: ' || stage_name,
        'deal',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create new trigger functions for additional notifications

-- Project completion notification
CREATE OR REPLACE FUNCTION notify_project_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_assignee RECORD;
  changer_id UUID;
BEGIN
  -- Get the current user (who is making the change)
  changer_id := auth.uid();
  
  -- Check if project is being marked as completed (you'll need to add a status column to projects)
  -- For now, we'll use deadline completion logic or milestone completion
  -- This is a placeholder - you may need to adjust based on your project completion logic
  
  RETURN NEW;
END;
$$;

-- Task completion notification
CREATE OR REPLACE FUNCTION notify_task_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  assignee_record RECORD;
  changer_id UUID;
BEGIN
  -- Get the current user (who is making the change)
  changer_id := auth.uid();
  
  -- Only notify if task status changed to completed
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    -- Notify all assignees except the one who completed it
    FOR assignee_record IN 
      SELECT user_id FROM public.task_assignees WHERE task_id = NEW.id
    LOOP
      IF changer_id IS NULL OR changer_id != assignee_record.user_id THEN
        PERFORM public.create_notification(
          assignee_record.user_id,
          'task_completed',
          'Task Completed',
          'Task "' || NEW.title || '" has been completed',
          'task',
          NEW.id
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Company advisor assignment notification
CREATE OR REPLACE FUNCTION notify_company_advisor_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  assigner_id UUID;
BEGIN
  -- Get the current user (who is making the assignment)
  assigner_id := auth.uid();
  
  -- Only notify if advisor_id is being set and assigner is different from new advisor
  IF (OLD.advisor_id IS NULL OR OLD.advisor_id != NEW.advisor_id) AND 
     NEW.advisor_id IS NOT NULL AND 
     (assigner_id IS NULL OR assigner_id != NEW.advisor_id) THEN
    -- Create notification
    PERFORM public.create_notification(
      NEW.advisor_id,
      'company_advisor_assigned',
      'Assigned as Company Advisor',
      'You have been assigned as advisor for: ' || NEW.name,
      'company',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Campaign assignment notification
CREATE OR REPLACE FUNCTION notify_campaign_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  campaign_name TEXT;
  assigner_id UUID;
BEGIN
  -- Get the current user (who is making the assignment)
  assigner_id := auth.uid();
  
  -- Only notify if the assigner is different from the assignee
  IF assigner_id IS NULL OR assigner_id != NEW.user_id THEN
    -- Get campaign name
    SELECT name INTO campaign_name FROM public.campaigns WHERE id = NEW.campaign_id;
    
    -- Create notification
    PERFORM public.create_notification(
      NEW.user_id,
      'campaign_assigned',
      'Assigned to Campaign',
      'You have been assigned to the campaign: ' || campaign_name,
      'campaign',
      NEW.campaign_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Campaign status change notification
CREATE OR REPLACE FUNCTION notify_campaign_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  assignee_record RECORD;
  changer_id UUID;
BEGIN
  -- Get the current user (who is making the change)
  changer_id := auth.uid();
  
  -- Only notify if status actually changed
  IF OLD.status != NEW.status THEN
    -- Notify all assigned users except the one who made the change
    FOR assignee_record IN 
      SELECT user_id FROM public.campaign_assignees WHERE campaign_id = NEW.id
    LOOP
      IF changer_id IS NULL OR changer_id != assignee_record.user_id THEN
        PERFORM public.create_notification(
          assignee_record.user_id,
          'campaign_status_changed',
          'Campaign Status Updated',
          'Campaign "' || NEW.name || '" status changed to: ' || NEW.status,
          'campaign',
          NEW.id
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Role change notification
CREATE OR REPLACE FUNCTION notify_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  changer_id UUID;
BEGIN
  -- Get the current user (who is making the change)
  changer_id := auth.uid();
  
  -- Only notify if role actually changed and it's not a self-change
  IF OLD.role != NEW.role AND (changer_id IS NULL OR changer_id != NEW.id) THEN
    PERFORM public.create_notification(
      NEW.id,
      'role_changed',
      'Role Updated',
      'Your role has been changed from ' || OLD.role || ' to ' || NEW.role,
      'profile',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Milestone creation notification
CREATE OR REPLACE FUNCTION notify_milestone_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  assignee_record RECORD;
  project_name TEXT;
  creator_id UUID;
BEGIN
  -- Get the current user (who is creating the milestone)
  creator_id := auth.uid();
  
  -- Get project name
  SELECT name INTO project_name FROM public.projects WHERE id = NEW.project_id;
  
  -- Notify all project assignees except the creator
  FOR assignee_record IN 
    SELECT user_id FROM public.project_assignees WHERE project_id = NEW.project_id
  LOOP
    IF creator_id IS NULL OR creator_id != assignee_record.user_id THEN
      PERFORM public.create_notification(
        assignee_record.user_id,
        'milestone_created',
        'New Milestone Created',
        'New milestone "' || NEW.name || '" created in project: ' || project_name,
        'milestone',
        NEW.id
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- File upload to project notification
CREATE OR REPLACE FUNCTION notify_file_upload_to_project()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  assignee_record RECORD;
  project_name TEXT;
  uploader_id UUID;
BEGIN
  -- Get the current user (who is uploading the file)
  uploader_id := auth.uid();
  
  -- Get project name
  SELECT name INTO project_name FROM public.projects WHERE id = NEW.project_id;
  
  -- Notify all project assignees except the uploader
  FOR assignee_record IN 
    SELECT user_id FROM public.project_assignees WHERE project_id = NEW.project_id
  LOOP
    IF uploader_id IS NULL OR uploader_id != assignee_record.user_id THEN
      PERFORM public.create_notification(
        assignee_record.user_id,
        'file_uploaded_to_project',
        'File Added to Project',
        'New file "' || NEW.name || '" uploaded to project: ' || project_name,
        'project',
        NEW.project_id
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create triggers for new notification functions
CREATE TRIGGER trigger_notify_task_completion
  AFTER UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION notify_task_completion();

CREATE TRIGGER trigger_notify_company_advisor_assignment
  AFTER UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION notify_company_advisor_assignment();

CREATE TRIGGER trigger_notify_campaign_assignment
  AFTER INSERT ON public.campaign_assignees
  FOR EACH ROW EXECUTE FUNCTION notify_campaign_assignment();

CREATE TRIGGER trigger_notify_campaign_status_change
  AFTER UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION notify_campaign_status_change();

CREATE TRIGGER trigger_notify_role_change
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION notify_role_change();

CREATE TRIGGER trigger_notify_milestone_creation
  AFTER INSERT ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION notify_milestone_creation();

CREATE TRIGGER trigger_notify_file_upload_to_project
  AFTER INSERT ON public.project_documents
  FOR EACH ROW EXECUTE FUNCTION notify_file_upload_to_project();
