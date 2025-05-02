
import { useState, useMemo } from "react";
import { EmployeeWithProfile } from "@/types/employee";

export function useEmployeeFilters(employees: EmployeeWithProfile[] = []) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");

  // Define specific employee types for filters
  const employeeTypes: string[] = useMemo(() => {
    return ["All Types", "Employee", "Freelancer"];
  }, []);
  
  // Filter employees based on search term and filters
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const firstName = employee.first_name || '';
      const lastName = employee.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const email = employee.email || '';
      
      const matchesSearch = 
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.phone_number || '').toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesType = typeFilter === "All Types" || employee.employee_type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [employees, searchTerm, typeFilter]);

  return {
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    employeeTypes,
    filteredEmployees
  };
}
