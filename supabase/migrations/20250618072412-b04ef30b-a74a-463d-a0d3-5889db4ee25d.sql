
-- Phase 1: Add new notification types to the enum
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'new_company_contact';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'new_subsidiary';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'company_edited';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'company_deleted';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'ads_status_change';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'ads_comments_change';

-- Phase 2: Company-related notification triggers

-- Function to notify when a new company contact is added
CREATE OR REPLACE FUNCTION public.notify_company_contact_added()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  company_name TEXT;
  contact_name TEXT;
  changer_id UUID;
BEGIN
  -- Get the current user (who is adding the contact)
  changer_id := auth.uid();
  
  -- Get company name and advisor
  SELECT name INTO company_name FROM public.companies WHERE id = NEW.company_id;
  
  -- Get contact name from profiles
  SELECT COALESCE(first_name || ' ' || last_name, 'Unknown Contact') INTO contact_name
  FROM public.profiles WHERE id = NEW.user_id;
  
  -- Notify company advisor if they exist and are different from the changer
  INSERT INTO public.notifications (user_id, type, title, message, entity_type, entity_id)
  SELECT 
    c.advisor_id,
    'new_company_contact',
    'New Company Contact Added',
    'New contact "' || contact_name || '" has been added to company: ' || company_name,
    'company',
    NEW.company_id
  FROM public.companies c
  WHERE c.id = NEW.company_id 
    AND c.advisor_id IS NOT NULL 
    AND (changer_id IS NULL OR changer_id != c.advisor_id);
  
  RETURN NEW;
END;
$function$;

-- Trigger for company contact additions
DROP TRIGGER IF EXISTS trigger_notify_company_contact_added ON public.company_contacts;
CREATE TRIGGER trigger_notify_company_contact_added
  AFTER INSERT ON public.company_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_company_contact_added();

-- Function to notify when a new subsidiary is added
CREATE OR REPLACE FUNCTION public.notify_subsidiary_added()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  parent_company_name TEXT;
  changer_id UUID;
BEGIN
  -- Get the current user (who is adding the subsidiary)
  changer_id := auth.uid();
  
  -- Only notify if parent_id is being set (new subsidiary)
  IF OLD.parent_id IS NULL AND NEW.parent_id IS NOT NULL THEN
    -- Get parent company name
    SELECT name INTO parent_company_name FROM public.companies WHERE id = NEW.parent_id;
    
    -- Notify parent company advisor if they exist and are different from the changer
    INSERT INTO public.notifications (user_id, type, title, message, entity_type, entity_id)
    SELECT 
      c.advisor_id,
      'new_subsidiary',
      'New Subsidiary Added',
      'New subsidiary "' || NEW.name || '" has been added under company: ' || parent_company_name,
      'company',
      NEW.parent_id
    FROM public.companies c
    WHERE c.id = NEW.parent_id 
      AND c.advisor_id IS NOT NULL 
      AND (changer_id IS NULL OR changer_id != c.advisor_id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Trigger for subsidiary additions
DROP TRIGGER IF EXISTS trigger_notify_subsidiary_added ON public.companies;
CREATE TRIGGER trigger_notify_subsidiary_added
  AFTER UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_subsidiary_added();

-- Function to notify when company information is edited
CREATE OR REPLACE FUNCTION public.notify_company_edited()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  changer_id UUID;
BEGIN
  -- Get the current user (who is editing the company)
  changer_id := auth.uid();
  
  -- Only notify if advisor exists and is different from the changer
  IF NEW.advisor_id IS NOT NULL AND (changer_id IS NULL OR changer_id != NEW.advisor_id) THEN
    -- Check if reminder already sent today to avoid spam
    IF NOT EXISTS (
      SELECT 1 FROM public.notifications
      WHERE user_id = NEW.advisor_id
        AND entity_type = 'company'
        AND entity_id = NEW.id
        AND type = 'company_edited'
        AND created_at >= CURRENT_DATE
    ) THEN
      PERFORM public.create_notification(
        NEW.advisor_id,
        'company_edited',
        'Company Information Updated',
        'Company "' || NEW.name || '" information has been updated',
        'company',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Trigger for company edits
DROP TRIGGER IF EXISTS trigger_notify_company_edited ON public.companies;
CREATE TRIGGER trigger_notify_company_edited
  AFTER UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_company_edited();

-- Function to notify when a company is deleted
CREATE OR REPLACE FUNCTION public.notify_company_deleted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  changer_id UUID;
BEGIN
  -- Get the current user (who is deleting the company)
  changer_id := auth.uid();
  
  -- Only notify if advisor exists and is different from the changer
  IF OLD.advisor_id IS NOT NULL AND (changer_id IS NULL OR changer_id != OLD.advisor_id) THEN
    PERFORM public.create_notification(
      OLD.advisor_id,
      'company_deleted',
      'Company Deleted',
      'Company "' || OLD.name || '" has been deleted from the system',
      'company',
      OLD.id
    );
  END IF;
  
  RETURN OLD;
END;
$function$;

-- Trigger for company deletions
DROP TRIGGER IF EXISTS trigger_notify_company_deleted ON public.companies;
CREATE TRIGGER trigger_notify_company_deleted
  BEFORE DELETE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_company_deleted();

-- Phase 2: Ad-related notification triggers

-- Function to notify when ad approval status changes
CREATE OR REPLACE FUNCTION public.notify_ad_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  assignee_record RECORD;
  campaign_name TEXT;
  changer_id UUID;
BEGIN
  -- Get the current user (who is changing the status)
  changer_id := auth.uid();
  
  -- Only notify if approval_status actually changed
  IF OLD.approval_status != NEW.approval_status THEN
    -- Get campaign name through adset
    SELECT c.name INTO campaign_name 
    FROM public.campaigns c
    JOIN public.adsets a ON c.id = a.campaign_id
    WHERE a.id = NEW.adset_id;
    
    -- Notify all campaign assignees except the one who made the change
    FOR assignee_record IN 
      SELECT ca.user_id 
      FROM public.campaign_assignees ca
      JOIN public.adsets a ON a.campaign_id = ca.campaign_id
      WHERE a.id = NEW.adset_id
    LOOP
      IF changer_id IS NULL OR changer_id != assignee_record.user_id THEN
        PERFORM public.create_notification(
          assignee_record.user_id,
          'ads_status_change',
          'Ad Status Updated',
          'Ad "' || NEW.name || '" in campaign "' || campaign_name || '" status changed to: ' || NEW.approval_status,
          'ad',
          NEW.id
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Trigger for ad status changes
DROP TRIGGER IF EXISTS trigger_notify_ad_status_change ON public.ads;
CREATE TRIGGER trigger_notify_ad_status_change
  AFTER UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_ad_status_change();

-- Function to notify when ad comment is added
CREATE OR REPLACE FUNCTION public.notify_ad_comment_added()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  assignee_record RECORD;
  campaign_name TEXT;
  ad_name TEXT;
  commenter_id UUID;
BEGIN
  -- Get the current user (who is adding the comment)
  commenter_id := auth.uid();
  
  -- Get ad name and campaign name
  SELECT a.name, c.name INTO ad_name, campaign_name
  FROM public.ads a
  JOIN public.adsets ads ON a.adset_id = ads.id
  JOIN public.campaigns c ON ads.campaign_id = c.id
  WHERE a.id = NEW.ad_id;
  
  -- Notify all campaign assignees except the commenter
  FOR assignee_record IN 
    SELECT ca.user_id 
    FROM public.campaign_assignees ca
    JOIN public.adsets ads ON ads.campaign_id = ca.campaign_id
    JOIN public.ads a ON a.adset_id = ads.id
    WHERE a.id = NEW.ad_id
  LOOP
    IF commenter_id IS NULL OR commenter_id != assignee_record.user_id THEN
      PERFORM public.create_notification(
        assignee_record.user_id,
        'ads_comments_change',
        'New Ad Comment',
        'New comment added to ad "' || ad_name || '" in campaign "' || campaign_name || '"',
        'ad',
        NEW.ad_id
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$function$;

-- Trigger for ad comment additions
DROP TRIGGER IF EXISTS trigger_notify_ad_comment_added ON public.ad_comments;
CREATE TRIGGER trigger_notify_ad_comment_added
  AFTER INSERT ON public.ad_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_ad_comment_added();
