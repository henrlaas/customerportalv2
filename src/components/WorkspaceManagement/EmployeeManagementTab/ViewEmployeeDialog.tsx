
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmployeeWithProfile } from "@/types/employee";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

interface ViewEmployeeDialogProps {
  employee: EmployeeWithProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewEmployeeDialog({
  employee,
  open,
  onOpenChange,
}: ViewEmployeeDialogProps) {
  const [showSSN, setShowSSN] = useState(false);

  if (!employee) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
          <DialogDescription>
            Full details for {employee.first_name} {employee.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Personal Information</h3>
              <Separator className="my-2" />
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Name:</span>
                  <p className="text-sm">
                    {employee.first_name} {employee.last_name}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Email:</span>
                  <p className="text-sm">{employee.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Phone:</span>
                  <p className="text-sm">{employee.phone_number || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Address:</span>
                  <p className="text-sm">{employee.address}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">City:</span>
                  <p className="text-sm">{employee.city}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">ZIP Code:</span>
                  <p className="text-sm">{employee.zipcode}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Country:</span>
                  <p className="text-sm">{employee.country}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Employment Details</h3>
              <Separator className="my-2" />
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Employee Type:</span>
                  <p className="text-sm">{employee.employee_type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Hourly Rate:</span>
                  <p className="text-sm">
                    {formatCurrency(employee.hourly_salary, "NOK")}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Employment %:</span>
                  <p className="text-sm">{employee.employed_percentage}%</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Social Security Number:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowSSN(!showSSN)}
                  >
                    {showSSN ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <p className="text-sm">
                    {showSSN
                      ? employee.social_security_number
                      : "••••••••••••"}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium">Account Number:</span>
                  <p className="text-sm">{employee.account_number}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Paycheck Solution:</span>
                  <p className="text-sm">{employee.paycheck_solution}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
