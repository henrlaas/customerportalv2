
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EmployeeWithProfile } from '@/types/employee';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

interface ViewEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  employee: EmployeeWithProfile;
}

export function ViewEmployeeDialog({ open, onClose, employee }: ViewEmployeeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">
              {employee.first_name} {employee.last_name}
            </h2>
            <p className="text-muted-foreground">{employee.email}</p>
            {employee.team && (
              <p className="text-sm bg-primary/10 text-primary rounded-full px-2 py-1 inline-block mt-2">
                Team: {employee.team}
              </p>
            )}
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Phone Number</Label>
                <p>{employee.phone_number || '-'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Employee Type</Label>
                <p>{employee.employee_type}</p>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Address</Label>
              <p>
                {employee.address}, {employee.zipcode} {employee.city}, {employee.country}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Hourly Salary</Label>
                <p>{employee.hourly_salary} NOK</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Employment Percentage</Label>
                <p>{employee.employed_percentage}%</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Social Security Number</Label>
                <p>{employee.social_security_number}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Account Number</Label>
                <p>{employee.account_number}</p>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Paycheck Solution</Label>
              <p>{employee.paycheck_solution}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
