
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Steps } from './Steps';
import { BasicInfoStep } from './BasicInfoStep';
import { EmploymentDetailsStep } from './EmploymentDetailsStep';
import { PaymentInfoStep } from './PaymentInfoStep';
import { EmployeeWithProfile } from '@/types/employee';

interface EditEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  employee: EmployeeWithProfile;
}

export function EditEmployeeDialog({ open, onClose, employee }: EditEmployeeDialogProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: employee.email,
    first_name: employee.first_name || '',
    last_name: employee.last_name || '',
    phone_number: employee.phone_number || '',
    address: employee.address,
    zipcode: employee.zipcode,
    country: employee.country,
    city: employee.city, // Ensure city is included here
    employee_type: employee.employee_type as 'Employee' | 'Freelancer',
    hourly_salary: employee.hourly_salary,
    employed_percentage: employee.employed_percentage,
    social_security_number: employee.social_security_number,
    account_number: employee.account_number,
    paycheck_solution: employee.paycheck_solution || '',
    team: employee.team || '', // Add team field
  });

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <Steps currentStep={step} />

        {step === 1 && (
          <BasicInfoStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            isEdit={true}
          />
        )}
        {step === 2 && (
          <EmploymentDetailsStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {step === 3 && (
          <PaymentInfoStep
            formData={formData}
            onBack={handleBack}
            onClose={handleClose}
            isEdit={true}
            employeeId={employee.id}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
