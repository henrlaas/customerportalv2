
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "@/services/employeeService";
import { useToast } from "@/components/ui/use-toast";
import { useEmployeeFilters } from "@/hooks/useEmployeeFilters";
import { EmployeeWithProfile } from "@/types/employee";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Trash2, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function EmployeeListView() {
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [viewEmployeeDialogOpen, setViewEmployeeDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithProfile | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employees
  const {
    data: employees = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: employeeService.listEmployees,
  });

  // Set up employee filters
  const {
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    employeeTypes,
    filteredEmployees,
  } = useEmployeeFilters(employees);

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: employeeService.deleteEmployee,
    onSuccess: () => {
      toast({
        title: "Employee deleted",
        description: "The employee has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete employee: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: employeeService.resetPassword,
    onSuccess: () => {
      toast({
        title: "Password reset email sent",
        description: "A password reset email has been sent to the employee.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send password reset: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (employeeToDelete) {
      deleteEmployeeMutation.mutate(employeeToDelete);
    }
  };

  const handleResetPassword = (email: string) => {
    resetPasswordMutation.mutate(email);
  };

  const handleRowClick = (employee: EmployeeWithProfile) => {
    setSelectedEmployee(employee);
    setViewEmployeeDialogOpen(true);
  };

  const toggleExpand = (employeeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedEmployee(expandedEmployee === employeeId ? null : employeeId);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading employees...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading employees: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="w-[180px]">
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

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Hourly Rate</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee) => (
                <TableRow 
                  key={employee.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(employee)}
                >
                  <TableCell className="font-medium">
                    {employee.first_name} {employee.last_name}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone_number || "N/A"}</TableCell>
                  <TableCell>{employee.employee_type}</TableCell>
                  <TableCell>
                    {formatCurrency(employee.hourly_salary, "NOK")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResetPassword(employee.email);
                        }}
                        title="Reset Password"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(employee.id);
                        }}
                        title="Delete Employee"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => toggleExpand(employee.id, e)}
                        title={expandedEmployee === employee.id ? "Collapse" : "Expand"}
                      >
                        {expandedEmployee === employee.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this employee and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
