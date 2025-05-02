
export interface Employee {
  id: string;
  address: string;
  zipcode: string;
  country: string;
  city: string; // Ensure city field is defined
  employee_type: 'Employee' | 'Freelancer'; // Restricted to specific types
  hourly_salary: number;
  employed_percentage: number;
  social_security_number: string;
  account_number: string;
  paycheck_solution: string;
  avatar_url?: string; // Optional avatar URL
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
  city: string; // Ensure city field is defined
  employee_type: 'Employee' | 'Freelancer'; // Restricted to specific types
  hourly_salary: number;
  employed_percentage: number;
  social_security_number: string;
  account_number: string;
  paycheck_solution: string;
  avatar_url?: string; // Optional avatar URL
  team?: string; // Add team field
}
