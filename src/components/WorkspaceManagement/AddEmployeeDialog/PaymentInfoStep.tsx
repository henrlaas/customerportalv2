
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { employeeService } from '@/services/employeeService';
import { useInviteEmployee } from '@/hooks/useInviteEmployee';
import { supabase } from '@/integrations/supabase/client';

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
    team: string;
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

  const inviteEmployee = useInviteEmployee({
    onSuccess: () => {
      toast({
        title: "Employee Added",
        description: `${formData.first_name} ${formData.last_name} has been added successfully. An invitation email has been sent.`,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add employee",
        variant: "destructive",
      });
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Update the parent formData with our local values before submission
    formData.social_security_number = localFormData.social_security_number;
    formData.account_number = localFormData.account_number;
    formData.paycheck_solution = localFormData.paycheck_solution;
    
    setIsSubmitting(true);
    try {
      if (isEdit && employeeId) {
        // Update existing employee
        const employeeData = {
          address: formData.address,
          zipcode: formData.zipcode,
          country: formData.country,
          city: formData.city,
          employee_type: formData.employee_type,
          hourly_salary: formData.hourly_salary,
          employed_percentage: formData.employed_percentage,
          social_security_number: formData.social_security_number,
          account_number: formData.account_number,
          paycheck_solution: formData.paycheck_solution || '',
          team: formData.team
        };
        
        await employeeService.updateEmployee(employeeId, employeeData);
        
        // Update profile information
        await supabase
          .from('profiles')
          .update({ 
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone_number: formData.phone_number || null,
            team: formData.team
          })
          .eq('id', employeeId);
        
        toast({
          title: "Employee Updated",
          description: `${formData.first_name} ${formData.last_name} has been updated successfully.`,
        });
        onClose();
      } else {
        // Create new employee using the dedicated invite function
        await inviteEmployee.mutateAsync({
          email: formData.email,
          firstName: formData.first_name,
          lastName: formData.last_name,
          phoneNumber: formData.phone_number || undefined,
          team: formData.team,
          address: formData.address,
          zipcode: formData.zipcode,
          country: formData.country,
          city: formData.city,
          employeeType: formData.employee_type,
          hourlySalary: formData.hourly_salary,
          employedPercentage: formData.employed_percentage,
          socialSecurityNumber: formData.social_security_number,
          accountNumber: formData.account_number,
          paycheckSolution: formData.paycheck_solution || ''
        });
      }
    } catch (error: any) {
      // Error handling is done by the hook for new employees
      if (isEdit) {
        toast({
          title: "Error",
          description: error.message || "Failed to update employee",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || inviteEmployee.isPending;

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
        <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading 
            ? (isEdit ? 'Updating Employee...' : 'Adding Employee...') 
            : (isEdit ? 'Update Employee' : 'Add Employee')}
        </Button>
      </div>
    </form>
  );
}
