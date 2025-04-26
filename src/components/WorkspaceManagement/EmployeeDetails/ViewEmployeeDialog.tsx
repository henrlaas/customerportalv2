
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmployeeWithProfile } from "@/types/employee";
import { Separator } from "@/components/ui/separator";

interface ViewEmployeeDialogProps {
  employee: EmployeeWithProfile | null;
  open: boolean;
  onClose: () => void;
}

export function ViewEmployeeDialog({ employee, open, onClose }: ViewEmployeeDialogProps) {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <Separator className="my-2" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{`${employee.first_name} ${employee.last_name}`}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium">{employee.phone_number || '-'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Employment Details</h3>
            <Separator className="my-2" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Employee Type</p>
                <p className="font-medium">{employee.employee_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hourly Salary</p>
                <p className="font-medium">{employee.hourly_salary} NOK</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employment Percentage</p>
                <p className="font-medium">{employee.employed_percentage}%</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Address Information</h3>
            <Separator className="my-2" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Street Address</p>
                <p className="font-medium">{employee.address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p className="font-medium">{employee.city || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Zip Code</p>
                <p className="font-medium">{employee.zipcode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Country</p>
                <p className="font-medium">{employee.country}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Payment Information</h3>
            <Separator className="my-2" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Social Security Number</p>
                <p className="font-medium">{employee.social_security_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-medium">{employee.account_number}</p>
              </div>
              {employee.employee_type === 'Freelancer' && (
                <div>
                  <p className="text-sm text-muted-foreground">Paycheck Solution</p>
                  <p className="font-medium">{employee.paycheck_solution || '-'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
