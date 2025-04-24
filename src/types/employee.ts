
export interface Employee {
  id: string;
  address: string;
  zipcode: string;
  country: string;
  employee_type: string;
  hourly_salary: number;
  employed_percentage: number;
  social_security_number: string;
  account_number: string;
  paycheck_solution: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeWithProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  address: string;
  zipcode: string;
  country: string;
  employee_type: string;
  hourly_salary: number;
  employed_percentage: number;
  social_security_number: string;
  account_number: string;
  paycheck_solution: string;
}
