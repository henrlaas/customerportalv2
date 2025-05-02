
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Employee } from '@/types/employee';
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
    paycheck_solution: string;
    team: string;
  };
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
  const [localFormData, setLocalFormData] = useState({ ...formData });
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Add the missing updateFormData function
  const updateFormData = (data: Partial<typeof formData>) => {
    setLocalFormData(prev => ({ ...prev, ...data }));
  };

  const validate = () => {
    if (!localFormData.account_number) {
      setError('Account number is required');
      return false;
    }
    if (!localFormData.social_security_number) {
      setError('Social security number is required');
      return false;
    }
    return true;
  };

  const createEmployeeRecord = async (userId: string) => {
    const employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'> = {
      address: localFormData.address,
      zipcode: localFormData.zipcode,
      country: localFormData.country,
      city: localFormData.city,
      employee_type: localFormData.employee_type,
      hourly_salary: localFormData.hourly_salary,
      employed_percentage: localFormData.employed_percentage,
      social_security_number: localFormData.social_security_number,
      account_number: localFormData.account_number,
      paycheck_solution: localFormData.paycheck_solution,
    };

    if (isEdit && employeeId) {
      // Update existing employee record
      await supabase
        .from('employees')
        .update(employeeData)
        .eq('id', employeeId);
    } else {
      // Create new employee record
      await supabase
        .from('employees')
        .insert([{ ...employeeData, id: userId }]);
    }
  };

  const createEmployee = async () => {
    try {
      setPending(true);
      setError(null);

      // Call Supabase Edge Function to create user
      const response = await supabase.functions.invoke('user-management', {
        body: {
          action: 'invite',
          email: localFormData.email,
          options: {
            data: {
              first_name: localFormData.first_name,
              last_name: localFormData.last_name,
              phone_number: localFormData.phone_number,
              team: localFormData.team,
              role: 'employee'
            }
          }
        },
      });

      if (response.error) {
        console.error('Error creating user:', response.error);
        
        if (response.error.message === 'User already exists') {
          // If user already exists, get the user ID by listing users with email filter
          const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
          
          if (userError) {
            throw new Error(`Failed to get user: ${userError.message}`);
          }

          // Find the user with matching email
          // Use type assertion to help TypeScript understand the structure
          type UserEntry = { id: string, email?: string };
          const users = userData?.users as UserEntry[] || [];
          const existingUser = users.find(user => user.email === localFormData.email);
          
          if (!existingUser) {
            throw new Error('User not found');
          }

          // Update the profile with the correct role and team
          await supabase
            .from('profiles')
            .update({
              role: 'employee',
              first_name: localFormData.first_name,
              last_name: localFormData.last_name,
              phone_number: localFormData.phone_number,
              team: localFormData.team
            })
            .eq('id', existingUser.id);

          // Continue with creating employee record using the existing user's ID
          const userId = existingUser.id;
          await createEmployeeRecord(userId);
          
        } else {
          // For any other error, throw it
          throw new Error(`Failed to create user: ${response.error.message}`);
        }
      } else {
        // If user creation was successful, get the user ID from response
        const userId = response.data.id;
        await createEmployeeRecord(userId);
      }

      // Close dialog and show success message
      onClose();
      toast({
        title: "Employee added",
        description: isEdit ? "Employee updated successfully" : "New employee added successfully",
      });
    } catch (err: any) {
      console.error('Error in employee creation process:', err);
      setError(err.message || 'Failed to create employee');
    } finally {
      setPending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await createEmployee();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Payment Information</h2>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="space-y-2">
          <Label htmlFor="social_security_number">Social Security Number</Label>
          <Input
            id="social_security_number"
            value={localFormData.social_security_number}
            onChange={(e) =>
              updateFormData({ social_security_number: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="account_number">Account Number</Label>
          <Input
            id="account_number"
            value={localFormData.account_number}
            onChange={(e) =>
              updateFormData({ account_number: e.target.value })
            }
          />
        </div>

        {localFormData.employee_type === 'Freelancer' && (
          <div className="space-y-2">
            <Label htmlFor="paycheck_solution">Paycheck Solution</Label>
            <Input
              id="paycheck_solution"
              value={localFormData.paycheck_solution}
              onChange={(e) =>
                updateFormData({ paycheck_solution: e.target.value })
              }
            />
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </form>
  );
}
