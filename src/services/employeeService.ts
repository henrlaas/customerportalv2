
import { supabase } from '@/integrations/supabase/client';
import { Employee, EmployeeWithProfile } from '@/types/employee';

export const employeeService = {
  async listEmployees(): Promise<EmployeeWithProfile[]> {
    // Use the stored procedure we created to join employees with profiles
    const { data, error } = await supabase
      .rpc('get_employees_with_profiles');

    if (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }

    // Debug the response data
    console.log('Raw employee data from DB:', data);

    // Ensure we're getting the expected data structure
    if (data && Array.isArray(data) && data.length > 0) {
      console.log('First employee example:', data[0]);
      // Don't access city directly on the JSON type since TypeScript doesn't recognize it
      // Instead, log the entire object and we'll see city in the console
      console.log('First employee data contains:', Object.keys(data[0]).join(', '));
    }

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

  async updateEmployee(employeeId: string, employeeData: Partial<Employee>): Promise<Employee> {
    // Update the employee record in the database
    const { data, error } = await supabase
      .from('employees')
      .update(employeeData)
      .eq('id', employeeId)
      .select()
      .single();

    if (error) throw error;
    return data as Employee;
  },

  async deleteEmployee(employeeId: string): Promise<void> {
    try {
      // Call the Supabase Edge Function to delete the user account
      const response = await supabase.functions.invoke('user-management', {
        body: {
          action: 'delete',
          userId: employeeId,
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to delete employee');
      }
      
      // Note: We don't need to delete the employee record from 'employees' table
      // or the profile from 'profiles' table as they both have foreign key constraints
      // that will automatically delete them when the user account is deleted (ON DELETE CASCADE)
      
      return;
    } catch (error) {
      console.error('Error in deleteEmployee:', error);
      throw error;
    }
  },
};
