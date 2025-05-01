
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "@/services/employeeService";
import { EmployeeWithProfile } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { EmployeeListView } from "./EmployeeListView";
import { AddEmployeeDialog } from "./AddEmployeeDialog";
import { DeleteEmployeeDialog } from "./DeleteEmployeeDialog";
import { ViewEmployeeDialog } from "./ViewEmployeeDialog";
import { UserPlus, Users } from "lucide-react";

export function EmployeeManagementTab() {
  const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [viewEmployeeDialogOpen, setViewEmployeeDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithProfile | null>(null);
  const queryClient = useQueryClient();
  
  // Fetch employees data
  const { data: employees = [], isLoading, error } = useQuery({
    queryKey: ["employees"],
    queryFn: employeeService.listEmployees,
  });
  
  const handleAddEmployee = () => {
    setAddEmployeeDialogOpen(true);
  };
  
  const handleDeleteEmployee = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setDeleteDialogOpen(true);
  };
  
  const handleViewEmployee = (employee: EmployeeWithProfile) => {
    setSelectedEmployee(employee);
    setViewEmployeeDialogOpen(true);
  };
  
  const handleAddSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["employees"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employees
          </h2>
          <p className="text-muted-foreground">
            Manage employees and their information.
          </p>
        </div>
        <Button onClick={handleAddEmployee} className="flex gap-2 items-center">
          <UserPlus className="h-4 w-4" />
          Add Employee
        </Button>
      </div>
      
      <EmployeeListView />
      
      <AddEmployeeDialog 
        open={addEmployeeDialogOpen}
        onOpenChange={setAddEmployeeDialogOpen}
        onSuccess={handleAddSuccess}
      />
      
      <DeleteEmployeeDialog
        employeeId={employeeToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
      
      <ViewEmployeeDialog
        employee={selectedEmployee}
        open={viewEmployeeDialogOpen}
        onOpenChange={setViewEmployeeDialogOpen}
      />
    </div>
  );
}
