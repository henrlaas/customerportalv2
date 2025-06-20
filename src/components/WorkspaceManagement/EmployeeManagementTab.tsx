
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
import { EmployeeSummaryCards } from './EmployeeSummaryCards';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function EmployeeManagementTab() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithProfile | null>(null);
  const { toast } = useToast();
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [isPendingReset, setIsPendingReset] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const EMPLOYEES_PER_PAGE = 15;

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

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / EMPLOYEES_PER_PAGE);
  const startIndex = (currentPage - 1) * EMPLOYEES_PER_PAGE;
  const endIndex = startIndex + EMPLOYEES_PER_PAGE;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

      {/* Employee Summary Cards */}
      <EmployeeSummaryCards employees={employees} />

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or phone"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleFilterChange();
            }}
          />
        </div>
        <div className="w-full sm:w-[200px] flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={typeFilter}
            onValueChange={(type) => {
              setTypeFilter(type);
              handleFilterChange();
            }}
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
            {paginatedEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No employees found matching your search criteria
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmployees.map((employee) => (
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

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}
              
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}

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
