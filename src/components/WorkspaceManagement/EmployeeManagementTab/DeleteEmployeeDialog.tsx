
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
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "@/services/employeeService";
import { useToast } from "@/components/ui/use-toast";

interface DeleteEmployeeDialogProps {
  employeeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteEmployeeDialog({
  employeeId,
  open,
  onOpenChange,
}: DeleteEmployeeDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteEmployeeMutation = useMutation({
    mutationFn: employeeService.deleteEmployee,
    onSuccess: () => {
      toast({
        title: "Employee deleted",
        description: "The employee has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete employee: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (employeeId) {
      deleteEmployeeMutation.mutate(employeeId);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete this employee and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            className="bg-red-500 hover:bg-red-600"
            disabled={deleteEmployeeMutation.isPending}
          >
            {deleteEmployeeMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
