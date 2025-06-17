
-- Add the missing 'team' column to the employees table
ALTER TABLE public.employees ADD COLUMN team text;

-- Update the existing employees to have a default team if needed
UPDATE public.employees SET team = 'General' WHERE team IS NULL;
