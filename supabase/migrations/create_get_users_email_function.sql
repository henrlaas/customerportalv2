
-- Function to safely get email addresses for users with admin privileges
CREATE OR REPLACE FUNCTION get_users_email(user_ids UUID[])
RETURNS TABLE(id UUID, email TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the requesting user is an admin or employee
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'employee') THEN
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_users_email TO authenticated;
