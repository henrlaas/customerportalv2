
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { employeeService } from '@/services/employeeService';
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

  const inviteEmployee = async (userId: string) => {
    try {
      // Get the current URL for redirect
      const siteUrl = window.location.origin;
      const redirectUrl = `${siteUrl}/set-password`;
      
      // Use our new edge function to send the invitation
      const response = await supabase.functions.invoke('invite-employee', {
        body: {
          email: formData.email,
          firstName: formData.first_name,
          lastName: formData.last_name,
          role: 'employee',
          team: formData.team,
          redirectUrl
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to send invitation');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error inviting employee:', error);
      throw error;
    }
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
          team: formData.team // Include team field for update
        };
        
        await employeeService.updateEmployee(employeeId, employeeData);
        
        // Update profile information
        await supabase
          .from('profiles')
          .update({ 
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone_number: formData.phone_number || null,
            team: formData.team || null
          })
          .eq('id', employeeId);
        
        toast({
          title: "Employee Updated",
          description: `${formData.first_name} ${formData.last_name} has been updated successfully.`,
        });
      } else {
        // Create new employee
        // First, use our custom invite employee function instead of userService.inviteUser
        const result = await inviteEmployee(formData.email);
        
        if (!result || !result.user) {
          throw new Error('Failed to create user');
        }

        const userId = result.user.id;

        // Create employee record - include the team field here
        const employeeData = {
          id: userId,
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
          team: formData.team // Add the team field here
        };
        
        await employeeService.createEmployee(employeeData, userId);
        
        // Directly update the profiles table with first name, last name, phone number and team
        await supabase
          .from('profiles')
          .update({ 
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone_number: formData.phone_number || null,
            team: formData.team || null,
            role: 'employee'
          })
          .eq('id', userId);
        
        toast({
          title: "Employee Added",
          description: `${formData.first_name} ${formData.last_name} has been added successfully. An invitation email has been sent.`,
        });
      }
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || (isEdit ? "Failed to update employee" : "Failed to add employee"),
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
            ? (isEdit ? 'Updating Employee...' : 'Adding Employee...') 
            : (isEdit ? 'Update Employee' : 'Add Employee')}
        </Button>
      </div>
    </form>
  );
}
