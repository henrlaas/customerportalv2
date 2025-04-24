
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { employeeService } from '@/services/employeeService';
import { useInviteUser } from '@/hooks/useInviteUser';

interface PaymentInfoStepProps {
  formData: {
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    address: string;
    zipcode: string;
    country: string;
    employee_type: string;
    hourly_salary: number;
    employed_percentage: number;
    social_security_number: string;
    account_number: string;
    paycheck_solution: string;
  };
  onBack: () => void;
  onClose: () => void;
}

export function PaymentInfoStep({ formData, onBack, onClose }: PaymentInfoStepProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Use the useInviteUser hook
  const inviteUserMutation = useInviteUser({
    onSuccess: () => {
      // Success handler (if needed)
    }
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.social_security_number) 
      newErrors.social_security_number = 'Social security number is required';
    
    if (!formData.account_number) 
      newErrors.account_number = 'Account number is required';
    
    if (!formData.paycheck_solution) 
      newErrors.paycheck_solution = 'Paycheck solution is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // First create the user
      const userData = {
        email: formData.email,
        firstName: formData.first_name,
        lastName: formData.last_name,
        role: 'employee',
        language: 'en',
        phoneNumber: formData.phone_number || undefined
      };
      
      const result = await inviteUserMutation.mutateAsync(userData);
      
      if (!result || !result.user) {
        throw new Error('Failed to create user');
      }

      // Then create the employee record
      const employeeData = {
        address: formData.address,
        zipcode: formData.zipcode,
        country: formData.country,
        employee_type: formData.employee_type,
        hourly_salary: formData.hourly_salary,
        employed_percentage: formData.employed_percentage,
        social_security_number: formData.social_security_number,
        account_number: formData.account_number,
        paycheck_solution: formData.paycheck_solution
      };
      
      await employeeService.createEmployee(employeeData, result.user.id);
      
      toast({
        title: "Employee Added",
        description: `${formData.first_name} ${formData.last_name} has been added successfully.`,
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add employee",
        variant: "destructive",
      });
    } finally {
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
            value={formData.social_security_number}
            onChange={(e) => formData.social_security_number = e.target.value}
          />
          {errors.social_security_number && <p className="text-sm text-red-500">{errors.social_security_number}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="account_number">Bank Account Number *</Label>
          <Input 
            id="account_number"
            value={formData.account_number}
            onChange={(e) => formData.account_number = e.target.value}
          />
          {errors.account_number && <p className="text-sm text-red-500">{errors.account_number}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="paycheck_solution">Paycheck Solution *</Label>
          <Select
            value={formData.paycheck_solution}
            onValueChange={(value) => formData.paycheck_solution = value}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select paycheck solution" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
          {errors.paycheck_solution && <p className="text-sm text-red-500">{errors.paycheck_solution}</p>}
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding Employee...' : 'Add Employee'}
        </Button>
      </div>
    </form>
  );
}
