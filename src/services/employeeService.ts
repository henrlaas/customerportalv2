
import { supabase } from '@/integrations/supabase/client';
import { Employee, EmployeeWithProfile } from '@/types/employee';

export const employeeService = {
  async listEmployees(): Promise<EmployeeWithProfile[]> {
    // Use the stored procedure we created to join employees with profiles
    const { data, error } = await supabase
      .rpc('get_employees_with_profiles');

    if (error) throw error;

    // Cast the returned data to the correct type with explicit type assertion
    // First cast to unknown, then to EmployeeWithProfile[] to avoid direct type conversion errors
    return (data as unknown as EmployeeWithProfile[]) || [];
  },

  async createEmployee(employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>, userId: string): Promise<Employee> {
    // Insert into the employees table with the proper type definitions
    const { data, error } = await supabase
      .from('employees')
      .insert([{ ...employeeData, id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data as Employee;
  },
};
