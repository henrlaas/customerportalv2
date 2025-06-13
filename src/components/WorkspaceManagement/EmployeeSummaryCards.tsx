
import { Users, UserCheck, DollarSign, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmployeeWithProfile } from '@/types/employee';

interface EmployeeSummaryCardsProps {
  employees: EmployeeWithProfile[];
}

export const EmployeeSummaryCards = ({ employees }: EmployeeSummaryCardsProps) => {
  // Calculate metrics from employee data
  const totalEmployees = employees.length;
  
  const employeeTypes = employees.reduce((acc, employee) => {
    acc[employee.employee_type] = (acc[employee.employee_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const employeeCount = employeeTypes['Employee'] || 0;
  const freelancerCount = employeeTypes['Freelancer'] || 0;
  
  // Calculate average salary
  const totalSalary = employees.reduce((sum, employee) => sum + employee.hourly_salary, 0);
  const averageSalary = totalEmployees > 0 ? totalSalary / totalEmployees : 0;
  
  // Calculate average employment percentage
  const totalEmploymentPercentage = employees.reduce((sum, employee) => sum + employee.employed_percentage, 0);
  const averageEmploymentPercentage = totalEmployees > 0 ? totalEmploymentPercentage / totalEmployees : 0;
  
  // Count full-time employees (100% employment)
  const fullTimeEmployees = employees.filter(employee => employee.employed_percentage >= 100).length;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Total Employees Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Employees</p>
              <p className="text-3xl font-bold text-blue-900">{totalEmployees}</p>
              <p className="text-xs text-blue-600 mt-1">Active workforce</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Types Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Employee Types</p>
              <div className="flex gap-4 mt-1">
                <div>
                  <p className="text-lg font-bold text-green-900">{employeeCount}</p>
                  <p className="text-xs text-green-600">Employees</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-900">{freelancerCount}</p>
                  <p className="text-xs text-green-600">Freelancers</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Salary Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Average Salary</p>
              <p className="text-3xl font-bold text-purple-900">{formatCurrency(averageSalary)}</p>
              <p className="text-xs text-purple-600 mt-1">Per hour</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Stats Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700">Employment Stats</p>
              <p className="text-3xl font-bold text-amber-900">{Math.round(averageEmploymentPercentage)}%</p>
              <p className="text-xs text-amber-600 mt-1">{fullTimeEmployees} full-time</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
