
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { employeeService } from '@/services/employeeService';
import { EmployeeFormData } from '@/types/employee';

interface PaymentInfoStepProps {
  formData: EmployeeFormData;
  onBack: () => void;
  onClose: () => void;
  isEdit?: boolean;
  employeeId?: string;
}

export function PaymentInfoStep({ formData, onBack, onClose, isEdit = false, employeeId }: PaymentInfoStepProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localFormData, setLocalFormData] = useState({
    socialSecurityNumber: formData.socialSecurityNumber,
    accountNumber: formData.accountNumber,
    paycheckSolution: formData.paycheckSolution || ''
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!localFormData.socialSecurityNumber) 
      newErrors.socialSecurityNumber = 'Social security number is required';
    
    if (!localFormData.accountNumber) 
      newErrors.accountNumber = 'Account number is required';
    
    if (formData.employeeType === 'Freelancer' && !localFormData.paycheckSolution)
      newErrors.paycheckSolution = 'Paycheck solution is required for Freelancers';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setLocalFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // Prepare the final employee data
      const employeeData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        zipcode: formData.zipcode,
        country: formData.country,
        city: formData.city,
        employeeType: formData.employeeType,
        hourlySalary: formData.hourlySalary,
        employedPercentage: formData.employedPercentage,
        socialSecurityNumber: localFormData.socialSecurityNumber,
        accountNumber: localFormData.accountNumber,
        paycheckSolution: localFormData.paycheckSolution
      };

      // Create the employee through our service
      await employeeService.createEmployee(employeeData);
      
      toast({
        title: "Employee Added",
        description: `${formData.firstName} ${formData.lastName} has been added successfully.`,
      });
      
      setIsSubmitting(false);
      onClose();
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add employee",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Payment Information</h2>
        
        <div className="space-y-2">
          <Label htmlFor="socialSecurityNumber">Social Security Number *</Label>
          <Input 
            id="socialSecurityNumber"
            value={localFormData.socialSecurityNumber}
            onChange={(e) => handleInputChange('socialSecurityNumber', e.target.value)}
          />
          {errors.socialSecurityNumber && <p className="text-sm text-red-500">{errors.socialSecurityNumber}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountNumber">Bank Account Number *</Label>
          <Input 
            id="accountNumber"
            value={localFormData.accountNumber}
            onChange={(e) => handleInputChange('accountNumber', e.target.value)}
          />
          {errors.accountNumber && <p className="text-sm text-red-500">{errors.accountNumber}</p>}
        </div>

        {formData.employeeType === 'Freelancer' && (
          <div className="space-y-2">
            <Label htmlFor="paycheckSolution">Paycheck Solution *</Label>
            <Input
              id="paycheckSolution"
              value={localFormData.paycheckSolution}
              onChange={(e) => handleInputChange('paycheckSolution', e.target.value)}
              placeholder="Enter paycheck solution details"
            />
            {errors.paycheckSolution && <p className="text-sm text-red-500">{errors.paycheckSolution}</p>}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting 
            ? 'Adding Employee...'
            : 'Add Employee'}
        </Button>
      </div>
    </form>
  );
}
