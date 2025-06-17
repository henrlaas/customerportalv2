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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Employees Card */}
      <Card className="bg-blue-50 text-blue-700 border-blue-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Total Employees</p>
              <p className="text-2xl font-bold mt-1">{totalEmployees}</p>
              <p className="text-xs opacity-80 mt-1">Active workforce</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      {/* Employee Types Card */}
      <Card className="bg-green-50 text-green-700 border-green-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Employee Types</p>
              <div className="flex gap-4 mt-1">
                <div>
                  <p className="text-lg font-bold">{employeeCount}</p>
                  <p className="text-xs opacity-80">Employees</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{freelancerCount}</p>
                  <p className="text-xs opacity-80">Freelancers</p>
                </div>
              </div>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      {/* Average Salary Card */}
      <Card className="bg-purple-50 text-purple-700 border-purple-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Average Salary</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(averageSalary)}</p>
              <p className="text-xs opacity-80 mt-1">Per hour</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      {/* Employment Stats Card */}
      <Card className="bg-orange-50 text-orange-700 border-orange-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Employment Stats</p>
              <p className="text-2xl font-bold mt-1">{Math.round(averageEmploymentPercentage)}%</p>
              <p className="text-xs opacity-80 mt-1">{fullTimeEmployees} full-time</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
