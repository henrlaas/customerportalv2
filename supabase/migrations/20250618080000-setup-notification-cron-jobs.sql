
-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any existing cron jobs to avoid duplicates
SELECT cron.unschedule('daily-due-date-check');
SELECT cron.unschedule('weekly-contract-reminders');
SELECT cron.unschedule('monthly-time-reminders');

-- Schedule daily due date and overdue task checks at 8:00 AM UTC
-- This will check for tasks due within 3 days and overdue tasks
SELECT cron.schedule(
  'daily-due-date-check',
  '0 8 * * *', -- Every day at 8:00 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://vjqbgnjeuvuxvuruewyc.supabase.co/functions/v1/check-due-dates',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqcWJnbmpldXZ1eHZ1cnVld3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NTA5MDIsImV4cCI6MjA1OTUyNjkwMn0.MvXDNmHq771t4TbZrrnaylqBoTcEONv0qv31sZYmAA8"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Schedule weekly contract reminders every Monday at 9:00 AM UTC
-- This will check for contracts that have been unsigned for over a week
SELECT cron.schedule(
  'weekly-contract-reminders',
  '0 9 * * 1', -- Every Monday at 9:00 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://vjqbgnjeuvuxvuruewyc.supabase.co/functions/v1/contract-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqcWJnbmpldXZ1eHZ1cnVld3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NTA5MDIsImV4cCI6MjA1OTUyNjkwMn0.MvXDNmHq771t4TbZrrnaylqBoTcEONv0qv31sZYmAA8"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Schedule monthly time entry reminders on the last day of each month at 10:00 AM UTC
-- This will remind users to review their time entries before month-end
SELECT cron.schedule(
  'monthly-time-reminders',
  '0 10 28-31 * *', -- Days 28-31 of every month at 10:00 AM UTC (function will check if it's the last day)
  $$
  SELECT
    net.http_post(
        url:='https://vjqbgnjeuvuxvuruewyc.supabase.co/functions/v1/monthly-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqcWJnbmpldXZ1eHZ1cnVld3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NTA5MDIsImV4cCI6MjA1OTUyNjkwMn0.MvXDNmHq771t4TbZrrnaylqBoTcEONv0qv31sZYmAA8"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Create a monitoring table to track cron job executions
CREATE TABLE IF NOT EXISTS public.cron_job_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name TEXT NOT NULL,
  execution_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on cron job logs (admin only access)
ALTER TABLE public.cron_job_logs ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view cron job logs
CREATE POLICY "Admins can view cron job logs" ON public.cron_job_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create a function to log cron job executions
CREATE OR REPLACE FUNCTION public.log_cron_execution(
  p_job_name TEXT,
  p_status TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.cron_job_logs (job_name, status, details)
  VALUES (p_job_name, p_status, p_details)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;
