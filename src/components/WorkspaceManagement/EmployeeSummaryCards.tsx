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
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
              <p className="text-3xl font-bold text-blue-600">{totalEmployees}</p>
              <p className="text-xs text-muted-foreground mt-1">Active workforce</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Types Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Employee Types</p>
              <div className="flex gap-4 mt-1">
                <div>
                  <p className="text-lg font-bold text-green-600">{employeeCount}</p>
                  <p className="text-xs text-muted-foreground">Employees</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{freelancerCount}</p>
                  <p className="text-xs text-muted-foreground">Freelancers</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Salary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average Salary</p>
              <p className="text-3xl font-bold text-purple-600">{formatCurrency(averageSalary)}</p>
              <p className="text-xs text-muted-foreground mt-1">Per hour</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Stats Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Employment Stats</p>
              <p className="text-3xl font-bold text-amber-600">{Math.round(averageEmploymentPercentage)}%</p>
              <p className="text-xs text-muted-foreground mt-1">{fullTimeEmployees} full-time</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
