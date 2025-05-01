
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

    // Parse the response data to ensure all fields are properly structured
    const parsedEmployees = data ? data.map((item: any) => {
      return {
        id: item.id,
        first_name: item.first_name,
        last_name: item.last_name,
        email: item.email,
        phone_number: item.phone_number,
        address: item.address,
        zipcode: item.zipcode,
        country: item.country,
        city: item.city,
        employee_type: item.employee_type,
        hourly_salary: item.hourly_salary,
        employed_percentage: item.employed_percentage,
        social_security_number: item.social_security_number,
        account_number: item.account_number,
        paycheck_solution: item.paycheck_solution,
        avatar_url: item.avatar_url
      } as EmployeeWithProfile;
    }) : [];

    return parsedEmployees;
  },

  async createEmployee(employeeData: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    zipcode: string;
    country: string;
    city: string;
    employeeType: 'Employee' | 'Freelancer';
    hourlySalary: number;
    employedPercentage: number;
    socialSecurityNumber: string;
    accountNumber: string;
    paycheckSolution?: string;
  }): Promise<{ id: string; email: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('employee-management', {
        body: {
          action: 'create',
          ...employeeData
        }
      });

      if (error) {
        console.error("Error creating employee:", error);
        throw new Error(error.message || 'Failed to create employee');
      }
      
      console.log("Employee created successfully:", data);
      return data;
    } catch (error: any) {
      console.error('Error in createEmployee:', error);
      throw new Error(error.message || 'Failed to create employee');
    }
  },

  async deleteEmployee(employeeId: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('employee-management', {
        body: {
          action: 'delete',
          employeeId
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to delete employee');
      }
      
      return;
    } catch (error: any) {
      console.error('Error in deleteEmployee:', error);
      throw error;
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('employee-management', {
        body: {
          action: 'resetPassword',
          email
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to send password reset');
      }
      
      return;
    } catch (error: any) {
      console.error('Error in resetPassword:', error);
      throw error;
    }
  }
};
