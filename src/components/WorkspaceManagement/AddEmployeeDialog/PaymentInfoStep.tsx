
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';

interface PaymentInfoStepProps {
  formData: any;
  onBack: () => void;
  onClose: () => void;
  isEdit?: boolean;
  employeeId?: string;
}

export function PaymentInfoStep({ 
  formData, 
  onBack, 
  onClose,
  isEdit = false,
  employeeId,
}: PaymentInfoStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Log the form data for debugging
      console.log('Form data to be submitted:', formData);

      if (isEdit && employeeId) {
        // Update existing employee
        await employeeService.updateEmployee(employeeId, formData);
        toast({
          title: 'Success',
          description: 'Employee updated successfully',
        });
      } else {
        // Create a new user first
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: Math.random().toString(36).slice(2, 10),
          email_confirm: true,
          user_metadata: {
            first_name: formData.first_name,
            last_name: formData.last_name,
          }
        });

        if (authError) {
          console.error('Error creating user:', authError);
          toast({
            title: 'Error',
            description: `Failed to create user: ${authError.message}`,
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        // Then create the employee record using the new user's ID
        const userId = authData.user.id;
        await employeeService.createEmployee({
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          team: formData.team,
          address: formData.address,
          zipcode: formData.zipcode,
          country: formData.country,
          city: formData.city,
          employee_type: formData.employee_type as Employee['employee_type'],
          hourly_salary: formData.hourly_salary,
          employed_percentage: formData.employed_percentage,
          social_security_number: formData.social_security_number,
          account_number: formData.account_number,
          paycheck_solution: formData.paycheck_solution,
        } as any, userId);

        toast({
          title: 'Success',
          description: 'Employee created successfully',
        });
      }

      // Invalidate and refetch employees data
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      // Close the dialog
      onClose();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEdit ? 'update' : 'create'} employee: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Payment Information</h2>
        
        <div className="space-y-2">
          <Label htmlFor="social_security_number">Social Security Number</Label>
          <Input
            id="social_security_number"
            value={formData.social_security_number}
            onChange={(e) => formData.social_security_number = e.target.value}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="account_number">Bank Account Number</Label>
          <Input
            id="account_number"
            value={formData.account_number}
            onChange={(e) => formData.account_number = e.target.value}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paycheck_solution">Paycheck Solution</Label>
          <Input
            id="paycheck_solution"
            value={formData.paycheck_solution}
            onChange={(e) => formData.paycheck_solution = e.target.value}
            placeholder="e.g., Tripletex, Visma"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
        </Button>
      </div>
    </form>
  );
}
