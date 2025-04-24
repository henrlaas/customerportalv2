
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { AddEmployeeDialog } from './AddEmployeeDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function EmployeeManagementTab() {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeService.listEmployees,
  });

  if (isLoading) {
    return <div>Loading employees...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Employee Management</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Hourly Rate</TableHead>
              <TableHead>Employment %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{`${employee.first_name || ''} ${employee.last_name || ''}`}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.phone_number || '-'}</TableCell>
                <TableCell>{employee.employee_type}</TableCell>
                <TableCell>{employee.hourly_salary} NOK</TableCell>
                <TableCell>{employee.employed_percentage}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddEmployeeDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} />
    </div>
  );
}
