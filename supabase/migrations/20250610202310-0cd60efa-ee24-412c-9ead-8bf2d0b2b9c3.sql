
-- Fix the ambiguous column reference in get_users_email function
CREATE OR REPLACE FUNCTION get_users_email(user_ids UUID[])
RETURNS TABLE(id UUID, email TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the requesting user is an admin or employee
  -- Fixed: Fully qualify the column reference to avoid ambiguity
  IF (SELECT role FROM public.profiles WHERE public.profiles.id = auth.uid()) IN ('admin', 'employee') THEN
    RETURN QUERY
      SELECT au.id, au.email::TEXT
      FROM auth.users au
      WHERE au.id = ANY(user_ids);
  ELSE
    -- For non-admin users, return only their own email if it's in the requested list
    RETURN QUERY
      SELECT au.id, au.email::TEXT
      FROM auth.users au
      WHERE au.id = auth.uid() AND au.id = ANY(user_ids);
  END IF;
END;
$$;
