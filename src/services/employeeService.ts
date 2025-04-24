
import { supabase } from '@/integrations/supabase/client';
import { Employee, EmployeeWithProfile } from '@/types/employee';

export const employeeService = {
  async listEmployees(): Promise<EmployeeWithProfile[]> {
    // Use a raw SQL query to join employees table with profiles and auth.users
    const { data: employees, error } = await supabase
      .rpc('get_employees_with_profiles');

    if (error) throw error;

    // Return the employees with their profile data
    return employees || [];
  },

  async createEmployee(employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>, userId: string): Promise<Employee> {
    // Insert into the employees table
    const { data, error } = await supabase
      .from('employees')
      .insert([{ ...employeeData, id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data as Employee;
  },
};
