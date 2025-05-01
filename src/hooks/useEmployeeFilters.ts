import { useState, useMemo } from 'react';
import { EmployeeWithProfile } from '@/types/employee';

export function useEmployeeFilters(employees: EmployeeWithProfile[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  
  // Get unique employee types for the filter
  const employeeTypes = useMemo(() => {
    const types = ['All', ...new Set(employees.map(employee => employee.employee_type))];
    return types;
  }, [employees]);
  
  // Filter employees based on search term and type filter
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      // Apply search filter
      const searchMatch = 
        (employee.first_name && employee.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (employee.last_name && employee.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (employee.email && employee.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (employee.phone_number && employee.phone_number.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Apply type filter
      const typeMatch = typeFilter === 'All' || employee.employee_type === typeFilter;
      
      return searchMatch && typeMatch;
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
