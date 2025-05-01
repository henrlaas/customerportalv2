
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  
  const inviteUserMutation = useInviteUser({
    onSuccess: async (data) => {
      // Extract the user ID from the nested response structure
      let userId;
      let isNewUser = true;
      
      // The response structure can be different based on whether it's a new or existing user
      if (data && data.user) {
        if (data.user.id) {
          // Direct user ID (simpler structure)
          userId = data.user.id;
        } else if (data.user.user && data.user.user.id) {
          // Nested user object (structure seen in logs)
          userId = data.user.user.id;
        }
      } else if (data && data.userId) {
        // Use the userId field directly if available
        userId = data.userId;
      }
      
      // Check if this is an existing user
      if (data && data.isNewUser === false) {
        isNewUser = false;
      }
      
      if (userId) {
        console.log("User invitation successful, creating employee record with user ID:", userId);
        try {
          // Check if the employee already exists
          const employeeExists = await employeeService.employeeExists(userId);
          
          if (employeeExists && !isEdit) {
            // If this is supposed to be a new employee, but it already exists, update it
            console.log("Employee already exists for this user, updating instead of creating");
            await handleUpdateEmployee(userId);
            toast({
              title: "Employee Updated",
              description: `${formData.first_name} ${formData.last_name}'s information has been updated.`,
            });
          } else if (!employeeExists) {
            // This is a new employee
            await handleCreateEmployee(userId);
            toast({
              title: "Employee Added",
              description: `${formData.first_name} ${formData.last_name} has been added successfully. ${isNewUser ? "An invitation email has been sent." : ""}`,
            });
          } else {
            // This is an edit operation on an existing employee
            await handleUpdateEmployee(userId);
            toast({
              title: "Employee Updated",
              description: `${formData.first_name} ${formData.last_name}'s information has been updated.`,
            });
          }
          
          setIsSubmitting(false);
          onClose();
        } catch (error) {
          handleError(error);
        }
      } else {
        console.error("Failed to get user ID from invitation response:", data);
        handleError(new Error("Failed to create employee: Invalid user ID in response"));
      }
    },
    onError: (error) => {
      handleError(error);
    }
  });

  const handleError = (error: any) => {
    setIsSubmitting(false);
    toast({
      title: "Error",
      description: error.message || "An error occurred during the operation",
      variant: "destructive",
    });
  };

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

  const getUpdatedEmployeeData = () => {
    // Combine parent formData with our local values
    return {
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
  
  const handleCreateEmployee = async (userId: string) => {
    try {
      const employeeData = getUpdatedEmployeeData();
      
      console.log("Creating employee record with data:", {
        userId,
        ...employeeData
      });
      
      // Create new employee record
      await employeeService.createEmployee({
        ...employeeData
      }, userId);
      
      return true;
    } catch (error: any) {
      console.error('Error creating employee record:', error);
      throw error;
    }
  };
  
  const handleUpdateEmployee = async (userId: string) => {
    try {
      const employeeData = getUpdatedEmployeeData();
      
      console.log("Updating employee record with data:", {
        userId,
        ...employeeData
      });
      
      // Use the provided employeeId or the userId for updating
      const idToUpdate = employeeId || userId;
      
      // Update existing employee record
      await employeeService.updateEmployee(idToUpdate, employeeData);
      
      return true;
    } catch (error: any) {
      console.error('Error updating employee record:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      if (isEdit && employeeId) {
        // Update existing employee
        await handleUpdateEmployee(employeeId);
        
        toast({
          title: "Employee Updated",
          description: `${formData.first_name} ${formData.last_name} has been updated successfully.`,
        });
        setIsSubmitting(false);
        onClose();
      } else {
        // Create new employee using inviteUserMutation
        console.log('Creating new employee with user data:', {
          email: formData.email,
          firstName: formData.first_name,
          lastName: formData.last_name,
          phoneNumber: formData.phone_number
        });
        
        // Get the current URL for redirect
        const siteUrl = window.location.origin;
        const redirectUrl = `${siteUrl}/set-password`;
        
        // Use the inviteUser hook
        inviteUserMutation.mutate({
          email: formData.email,
          firstName: formData.first_name,
          lastName: formData.last_name,
          phoneNumber: formData.phone_number || undefined,
          role: 'employee',
          language: 'en',
          redirect: redirectUrl,
          team: 'Employees',
          sendEmail: true // Explicitly request to send invitation email
        });
      }
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: error.message || (isEdit ? "Failed to update employee" : "Failed to add employee"),
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
            ? (isEdit ? 'Updating Employee...' : 'Adding Employee...') 
            : (isEdit ? 'Update Employee' : 'Add Employee')}
        </Button>
      </div>
    </form>
  );
}
