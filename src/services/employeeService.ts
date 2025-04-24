
import { supabase } from '@/integrations/supabase/client';
import { Employee, EmployeeWithProfile } from '@/types/employee';

export const employeeService = {
  async listEmployees(): Promise<EmployeeWithProfile[]> {
    const { data: employees, error } = await supabase
      .from('employees')
      .select(`
        *,
        auth_user:id (
          email
        ),
        profile:id (
          first_name,
          last_name,
          phone_number
        )
      `);

    if (error) throw error;

    return employees.map((employee: any) => ({
      ...employee,
      email: employee.auth_user.email,
      first_name: employee.profile.first_name,
      last_name: employee.profile.last_name,
      phone_number: employee.profile.phone_number,
    }));
  },

  async createEmployee(employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>, userId: string): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert([{ ...employeeData, id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
