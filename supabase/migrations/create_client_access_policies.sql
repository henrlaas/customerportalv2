
-- Create a function to check if a user is associated with a company (directly or indirectly)
CREATE OR REPLACE FUNCTION public.is_company_member_or_parent(company_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is directly a member of the company
  IF EXISTS (
    SELECT 1 FROM public.company_contacts
    WHERE user_id = auth.uid() AND company_id = company_uuid
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check if user is a member of a parent company
  RETURN EXISTS (
    WITH RECURSIVE company_hierarchy AS (
      -- Base case: Get companies where the user is directly a contact
      SELECT c.id, c.parent_id
      FROM public.companies c
      JOIN public.company_contacts cc ON c.id = cc.company_id
      WHERE cc.user_id = auth.uid()
      
      UNION ALL
      
      -- Recursive case: Get parent companies
      SELECT p.id, p.parent_id
      FROM public.companies p
      JOIN company_hierarchy ch ON p.id = ch.parent_id
    )
    SELECT 1 FROM company_hierarchy WHERE id = company_uuid
  )
  OR
  -- Check if the company is a subsidiary of a company where the user is a contact
  EXISTS (
    WITH RECURSIVE company_hierarchy AS (
      -- Base case: Get companies where the user is directly a contact
      SELECT c.id, c.parent_id
      FROM public.companies c
      JOIN public.company_contacts cc ON c.id = cc.company_id
      WHERE cc.user_id = auth.uid()
      
      UNION ALL
      
      -- Recursive case: Get child companies (subsidiaries)
      SELECT c.id, c.parent_id
      FROM public.companies c
      JOIN company_hierarchy ch ON c.parent_id = ch.id
    )
    SELECT 1 FROM company_hierarchy WHERE id = company_uuid
  );
END;
$$;

-- Update RLS policies for companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Policy for admins and employees - full access
CREATE POLICY "Admins and employees have full access to companies"
ON public.companies
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'employee')
);

-- Policy for clients - can only view their associated companies
CREATE POLICY "Clients can view their associated companies"
ON public.companies
FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'client'
  AND 
  public.is_company_member_or_parent(id)
);

-- Update RLS policies for company_contacts table
ALTER TABLE public.company_contacts ENABLE ROW LEVEL SECURITY;

-- Policy for admins and employees - full access
CREATE POLICY "Admins and employees have full access to company_contacts"
ON public.company_contacts
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'employee')
);

-- Policy for clients - can only view contacts of their associated companies
CREATE POLICY "Clients can view contacts of their associated companies"
ON public.company_contacts
FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'client'
  AND 
  public.is_company_member_or_parent(company_id)
);

-- Ensure profiles table has RLS enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can see their own profile
CREATE POLICY "Users can see their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Admins can see all profiles
CREATE POLICY "Admins can see all profiles"
ON public.profiles
FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
