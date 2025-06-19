
-- Add price_type column to deals table
ALTER TABLE public.deals 
ADD COLUMN price_type text;

-- Add check constraint to ensure valid values
ALTER TABLE public.deals 
ADD CONSTRAINT deals_price_type_check 
CHECK (price_type IN ('MRR', 'Project'));
