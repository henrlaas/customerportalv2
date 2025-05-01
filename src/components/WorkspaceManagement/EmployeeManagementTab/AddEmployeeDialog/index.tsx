
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Steps } from './Steps';
import { BasicInfoStep } from './BasicInfoStep';
import { EmploymentDetailsStep } from './EmploymentDetailsStep';
import { PaymentInfoStep } from './PaymentInfoStep';
import { EmployeeFormData } from '@/types/employee';

interface AddEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
}

// Default form data for a new employee
const defaultFormData: EmployeeFormData = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  zipcode: '',
  country: '',
  city: '',
  employeeType: 'Employee',
  hourlySalary: 0,
  employedPercentage: 100,
  socialSecurityNumber: '',
  accountNumber: '',
  paycheckSolution: '',
};

export function AddEmployeeDialog({ open, onClose }: AddEmployeeDialogProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<EmployeeFormData>({ ...defaultFormData });

  const updateFormData = (data: Partial<EmployeeFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleClose = () => {
    // Reset the form when closing
    setStep(1);
    setFormData({ ...defaultFormData });
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
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
