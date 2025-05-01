
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
      // Log the entire object and keys for debugging
      console.log('First employee data contains:', Object.keys(data[0]).join(', '));
    }

    // Parse the JSON structure correctly to ensure all fields are accessible
    const parsedEmployees = data ? data.map((item: any) => {
      // Log specific JSON parsing for debugging
      console.log('Processing employee item with city:', item.city);
      
      // Return a properly structured employee object ensuring all fields are included
      return {
        id: item.id,
        first_name: item.first_name,
        last_name: item.last_name,
        email: item.email,
        phone_number: item.phone_number,
        address: item.address,
        zipcode: item.zipcode,
        country: item.country,
        city: item.city, // Explicitly include the city field
        employee_type: item.employee_type,
        hourly_salary: item.hourly_salary,
        employed_percentage: item.employed_percentage,
        social_security_number: item.social_security_number,
        account_number: item.account_number,
        paycheck_solution: item.paycheck_solution
      } as EmployeeWithProfile;
    }) : [];

    return parsedEmployees;
  },

  async employeeExists(userId: string): Promise<boolean> {
    console.log("Checking if employee exists with ID:", userId);
    
    const { data, error } = await supabase
      .from('employees')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows returned", which is not an error for us
      console.error("Error checking if employee exists:", error);
      throw error;
    }
    
    return !!data;
  },

  async createEmployee(employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>, userId: string): Promise<Employee> {
    console.log("Creating employee with ID:", userId, "and data:", employeeData);
    
    // First check if employee exists to avoid duplicate key errors
    const exists = await this.employeeExists(userId);
    if (exists) {
      console.error("Cannot create employee: ID already exists:", userId);
      throw new Error("Employee with this ID already exists. Cannot create duplicate.");
    }
    
    // Insert into the employees table with the proper type definitions and explicitly set the id
    const { data, error } = await supabase
      .from('employees')
      .insert([{ ...employeeData, id: userId }])
      .select()
      .single();

    if (error) {
      console.error("Error creating employee:", error);
      throw error;
    }
    
    console.log("Employee created successfully:", data);
    return data as Employee;
  },

  async deleteEmployee(employeeId: string): Promise<void> {
    try {
      // Delete the employee record directly
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);
      
      if (error) {
        throw new Error(error.message || 'Failed to delete employee');
      }
      
      return;
    } catch (error) {
      console.error('Error in deleteEmployee:', error);
      throw error;
    }
  },
};
