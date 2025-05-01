
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { employeeService } from '@/services/employeeService';

interface PaymentInfoStepProps {
  formData: {
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    zipcode: string;
    country: string;
    city: string;
    employee_type: 'Employee' | 'Freelancer';
    hourly_salary: number;
    employed_percentage: number;
    social_security_number: string;
    account_number: string;
    paycheck_solution?: string;
  };
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
    social_security_number: formData.social_security_number,
    account_number: formData.account_number,
    paycheck_solution: formData.paycheck_solution || ''
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!localFormData.social_security_number) 
      newErrors.social_security_number = 'Social security number is required';
    
    if (!localFormData.account_number) 
      newErrors.account_number = 'Account number is required';
    
    if (formData.employee_type === 'Freelancer' && !localFormData.paycheck_solution)
      newErrors.paycheck_solution = 'Paycheck solution is required for Freelancers';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setLocalFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getEmployeeData = () => {
    // Combine parent formData with our local values
    return {
      // Use a random UUID as the ID for new employees
      id: crypto.randomUUID(),
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone_number: formData.phone_number || '',
      address: formData.address,
      zipcode: formData.zipcode,
      country: formData.country,
      city: formData.city,
      employee_type: formData.employee_type,
      hourly_salary: formData.hourly_salary,
      employed_percentage: formData.employed_percentage,
      social_security_number: localFormData.social_security_number,
      account_number: localFormData.account_number,
      paycheck_solution: localFormData.paycheck_solution || ''
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const employeeData = getEmployeeData();
      
      console.log('Creating new employee with data:', employeeData);
      
      // Create new employee record directly without user invitation
      await employeeService.createEmployee({
        address: employeeData.address,
        zipcode: employeeData.zipcode,
        country: employeeData.country,
        city: employeeData.city,
        employee_type: employeeData.employee_type,
        hourly_salary: employeeData.hourly_salary,
        employed_percentage: employeeData.employed_percentage,
        social_security_number: employeeData.social_security_number,
        account_number: employeeData.account_number,
        paycheck_solution: employeeData.paycheck_solution || ''
      }, employeeData.id);
      
      toast({
        title: "Employee Added",
        description: `${formData.first_name} ${formData.last_name} has been added successfully.`,
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
          <Label htmlFor="social_security_number">Social Security Number *</Label>
          <Input 
            id="social_security_number"
            value={localFormData.social_security_number}
            onChange={(e) => handleInputChange('social_security_number', e.target.value)}
          />
          {errors.social_security_number && <p className="text-sm text-red-500">{errors.social_security_number}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="account_number">Bank Account Number *</Label>
          <Input 
            id="account_number"
            value={localFormData.account_number}
            onChange={(e) => handleInputChange('account_number', e.target.value)}
          />
          {errors.account_number && <p className="text-sm text-red-500">{errors.account_number}</p>}
        </div>

        {formData.employee_type === 'Freelancer' && (
          <div className="space-y-2">
            <Label htmlFor="paycheck_solution">Paycheck Solution *</Label>
            <Input
              id="paycheck_solution"
              value={localFormData.paycheck_solution}
              onChange={(e) => handleInputChange('paycheck_solution', e.target.value)}
              placeholder="Enter paycheck solution details"
            />
            {errors.paycheck_solution && <p className="text-sm text-red-500">{errors.paycheck_solution}</p>}
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
