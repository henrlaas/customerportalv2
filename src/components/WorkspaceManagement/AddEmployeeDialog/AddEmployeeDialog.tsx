
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Steps } from './Steps';
import { BasicInfoStep } from './BasicInfoStep';
import { EmploymentDetailsStep } from './EmploymentDetailsStep';
import { PaymentInfoStep } from './PaymentInfoStep';

interface AddEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddEmployeeDialog({ open, onClose }: AddEmployeeDialogProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '+47', // Initialize with +47 prefix
    address: '',
    zipcode: '',
    country: 'Norway', // Initialize with Norway as default
    city: '',
    employee_type: 'Employee' as 'Employee' | 'Freelancer',
    hourly_salary: 0,
    employed_percentage: 100,
    social_security_number: '',
    account_number: '',
    paycheck_solution: '',
    team: '', // Add team field
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
