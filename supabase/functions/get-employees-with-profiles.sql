
-- Create a stored function to fetch employees with profile data
CREATE OR REPLACE FUNCTION public.get_employees_with_profiles()
RETURNS SETOF json LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    json_build_object(
      'id', e.id,
      'email', u.email,
      'first_name', p.first_name,
      'last_name', p.last_name,
      'phone_number', p.phone_number,
      'address', e.address,
      'zipcode', e.zipcode,
      'country', e.country,
      'city', e.city,
      'employee_type', e.employee_type,
      'hourly_salary', e.hourly_salary,
      'employed_percentage', e.employed_percentage,
      'social_security_number', e.social_security_number,
      'account_number', e.account_number,
      'paycheck_solution', e.paycheck_solution
    )
  FROM 
    public.employees e
  JOIN 
    auth.users u ON e.id = u.id
  LEFT JOIN 
    public.profiles p ON e.id = p.id;
END;
$$;
