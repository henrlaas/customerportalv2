
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import { Button } from '@/components/ui/button';
import { UserPlus, Pencil, Trash2 } from 'lucide-react';
import { AddEmployeeDialog } from './AddEmployeeDialog';
import { EditEmployeeDialog } from './AddEmployeeDialog/EditEmployeeDialog';
import { DeleteEmployeeDialog } from './AddEmployeeDialog/DeleteEmployeeDialog';
import { EmployeeWithProfile } from '@/types/employee';
import { useToast } from '@/components/ui/use-toast';
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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithProfile | null>(null);
  const { toast } = useToast();

  const { data: employees = [], isLoading, refetch } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeService.listEmployees,
  });

  const handleEditEmployee = (employee: EmployeeWithProfile) => {
    setSelectedEmployee(employee);
    setShowEditDialog(true);
  };

  const handleDeleteEmployee = (employee: EmployeeWithProfile) => {
    setSelectedEmployee(employee);
    setShowDeleteDialog(true);
  };

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
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditEmployee(employee)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-600" 
                      onClick={() => handleDeleteEmployee(employee)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddEmployeeDialog 
        open={showAddDialog} 
        onClose={() => {
          setShowAddDialog(false);
          refetch();
        }} 
      />

      {selectedEmployee && (
        <>
          <EditEmployeeDialog
            open={showEditDialog}
            onClose={() => {
              setShowEditDialog(false);
              setSelectedEmployee(null);
              refetch();
            }}
            employee={selectedEmployee}
          />
          
          <DeleteEmployeeDialog
            open={showDeleteDialog}
            onClose={() => {
              setShowDeleteDialog(false);
              setSelectedEmployee(null);
              refetch();
            }}
            employee={selectedEmployee}
          />
        </>
      )}
    </div>
  );
}
