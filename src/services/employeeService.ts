
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
        team: item.team, 
        city: item.city,
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

  async createEmployee(employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>, userId: string): Promise<Employee> {
    console.log('Creating employee with data:', employeeData);
    
    // Extract profile data from employeeData
    const { first_name, last_name, phone_number, team, ...employeeFields } = employeeData as any;
    
    // Insert into the employees table with ONLY employee fields
    console.log('Employee fields for employees table:', employeeFields);
    const { data, error } = await supabase
      .from('employees')
      .insert([{ ...employeeFields, id: userId }])
      .select()
      .single();

    if (error) {
      console.error('Error creating employee record:', error);
      throw error;
    }
    
    // Now update the profile table with the profile fields
    console.log('Updating profile with:', { first_name, last_name, phone_number, team });
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        first_name, 
        last_name, 
        phone_number,
        team 
      })
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error updating profile for employee:', profileError);
      throw profileError;
    }
    
    // After successfully creating the employee, send the password reset email
    try {
      await this.sendInviteEmail(userId);
      console.log('Invitation email sent to newly created employee');
    } catch (resetError) {
      console.error('Error sending invitation email:', resetError);
      // We don't throw here as the employee was already created successfully
    }

    // Cast data as Employee explicitly after validating it meets the Employee interface
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid employee data returned from database');
    }
    
    return data as Employee;
  },

  async updateEmployee(employeeId: string, employeeData: Partial<Employee>): Promise<Employee> {
    console.log('Updating employee with data:', employeeData);
    
    // Extract profile data from employeeData
    const { first_name, last_name, phone_number, team, ...employeeFields } = employeeData as any;
    
    // Only update the employee table if there are employee fields to update
    let updatedEmployee: any = null;
    
    if (Object.keys(employeeFields).length > 0) {
      console.log('Employee fields for employees table:', employeeFields);
      const { data, error } = await supabase
        .from('employees')
        .update(employeeFields)
        .eq('id', employeeId)
        .select()
        .single();

      if (error) {
        console.error('Error updating employee record:', error);
        throw error;
      }
      
      updatedEmployee = data;
    }
    
    // Update the profile table if there are profile fields to update
    if (first_name !== undefined || last_name !== undefined || phone_number !== undefined || team !== undefined) {
      const profileData: any = {};
      if (first_name !== undefined) profileData.first_name = first_name;
      if (last_name !== undefined) profileData.last_name = last_name;
      if (phone_number !== undefined) profileData.phone_number = phone_number;
      if (team !== undefined) profileData.team = team;
      
      console.log('Updating profile with:', profileData);
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', employeeId);
      
      if (profileError) {
        console.error('Error updating profile for employee:', profileError);
        throw profileError;
      }
    }
    
    // Get the updated employee with profile data
    const { data: fetchedEmployee, error: fetchError } = await supabase
      .rpc('get_employees_with_profiles')
      .filter('id', 'eq', employeeId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching updated employee:', fetchError);
      throw fetchError;
    }
    
    // Cast the response to Employee after validating it's not null or an array
    if (!fetchedEmployee || Array.isArray(fetchedEmployee)) {
      throw new Error('Invalid employee data returned from database');
    }
    
    // Ensure the response matches our Employee type
    return fetchedEmployee as unknown as Employee;
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

  async sendPasswordResetEmail(userId: string): Promise<void> {
    // Keep the old method for compatibility, but use the new one internally
    return this.sendInviteEmail(userId);
  },
  
  async sendInviteEmail(userId: string): Promise<void> {
    try {
      // First, we need to get the user's email using the user-management edge function
      const userResponse = await supabase.functions.invoke('user-management', {
        body: {
          action: 'get-user-by-id',
          userId: userId
        }
      });

      if (userResponse.error) {
        throw new Error(`Error fetching user email: ${userResponse.error.message}`);
      }

      if (!userResponse.data || !userResponse.data.email) {
        throw new Error('User email not found');
      }

      const userEmail = userResponse.data.email;
      const siteUrl = window.location.origin;

      // Use our dedicated edge function for sending reset password invites
      console.log(`Sending invite email to ${userEmail} with redirect URL: ${siteUrl}`);
      
      try {
        const response = await supabase.functions.invoke('inviteEmployeeResetPassword', {
          body: {
            email: userEmail,
            redirectUrl: siteUrl
          }
        });

        // Log the full response for debugging
        console.log('inviteEmployeeResetPassword response:', response);

        if (response.error) {
          throw new Error(`Failed to send invitation email: ${response.error.message}`);
        }
      } catch (invokeError) {
        console.error('Error invoking inviteEmployeeResetPassword function:', invokeError);
        throw new Error(`Error invoking edge function: ${invokeError.message || 'Unknown error'}`);
      }

      console.log('Invitation email sent successfully to:', userEmail);
      return;
    } catch (error) {
      console.error('Error in sendInviteEmail:', error);
      throw error;
    }
  }
};
