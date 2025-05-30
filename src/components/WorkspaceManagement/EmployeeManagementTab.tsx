import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Pencil, Trash2, Search, Filter, KeyRound } from 'lucide-react';
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
import { ViewEmployeeDialog } from './EmployeeDetails/ViewEmployeeDialog';
import { useEmployeeFilters } from '@/hooks/useEmployeeFilters';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userService } from '@/services/userService';

export function EmployeeManagementTab() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithProfile | null>(null);
  const { toast } = useToast();
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [isPendingReset, setIsPendingReset] = useState(false);

  const { data: employees = [], isLoading, refetch } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeService.listEmployees,
  });

  // Use our custom filter hook
  const {
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    employeeTypes,
    filteredEmployees
  } = useEmployeeFilters(employees);

  // Debug the employee data when it changes
  useEffect(() => {
    if (employees.length > 0) {
      console.log('Employee data in management tab:', employees);
      // Check if city is present for each employee
      employees.forEach((employee, index) => {
        console.log(`Employee ${index + 1} city:`, employee.city);
      });
    }
  }, [employees]);

  const handleEditEmployee = (employee: EmployeeWithProfile, e: React.MouseEvent) => {
    // Prevent the row click event from firing
    e.stopPropagation();
    console.log('Opening edit dialog for employee:', employee);
    setSelectedEmployee(employee);
    setShowEditDialog(true);
  };

  const handleDeleteEmployee = (employee: EmployeeWithProfile, e: React.MouseEvent) => {
    // Prevent the row click event from firing
    e.stopPropagation();
    setSelectedEmployee(employee);
    setShowDeleteDialog(true);
  };

  const handleViewEmployee = (employee: EmployeeWithProfile) => {
    console.log('Opening view dialog for employee with city:', employee.city);
    setSelectedEmployee(employee);
    setShowViewDialog(true);
  };

  const handleResetPassword = async (employee: EmployeeWithProfile, e: React.MouseEvent) => {
    // Prevent the row click event from firing
    e.stopPropagation();
    
    if (isPendingReset) return;
    
    try {
      setIsPendingReset(true);
      await userService.resetPassword(employee.email);
      toast({
        title: 'Password Reset Email Sent',
        description: `A password reset email has been sent to ${employee.email}`,
      });
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast({
        title: 'Error',
        description: 'Failed to send password reset email',
        variant: 'destructive',
      });
    } finally {
      setIsPendingReset(false);
    }
  };

  // Get user initials from first_name and last_name
  const getUserInitials = (employee: EmployeeWithProfile) => {
    const firstName = employee.first_name || '';
    const lastName = employee.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (employee.email) {
      return employee.email.charAt(0).toUpperCase();
    } else {
      return "?";
    }
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

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or phone"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-[200px] flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {employeeTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted">
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
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No employees found matching your search criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee) => (
                <TableRow 
                  key={employee.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleViewEmployee(employee)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={employee.avatar_url} alt={`${employee.first_name} ${employee.last_name}`} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getUserInitials(employee)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{`${employee.first_name || ''} ${employee.last_name || ''}`}</span>
                    </div>
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone_number || '-'}</TableCell>
                  <TableCell>{employee.employee_type}</TableCell>
                  <TableCell>{employee.hourly_salary} NOK</TableCell>
                  <TableCell>{employee.employed_percentage}%</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleEditEmployee(employee, e)}
                        title="Edit Employee"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleResetPassword(employee, e)}
                        disabled={isPendingReset}
                        title="Reset Password"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500 hover:text-red-600" 
                        onClick={(e) => handleDeleteEmployee(employee, e)}
                        title="Delete Employee"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
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

          <ViewEmployeeDialog
            open={showViewDialog}
            onClose={() => {
              setShowViewDialog(false);
              setSelectedEmployee(null);
            }}
            employee={selectedEmployee}
          />
        </>
      )}
    </div>
  );
}
