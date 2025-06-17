
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type InviteEmployeeParams = {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  team: string;
  address: string;
  zipcode: string;
  country: string;
  city: string;
  employeeType: 'Employee' | 'Freelancer';
  hourlySalary: number;
  employedPercentage: number;
  socialSecurityNumber: string;
  accountNumber: string;
  paycheckSolution?: string;
  redirectUrl?: string;
};

type UseInviteEmployeeProps = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export const useInviteEmployee = ({ onSuccess, onError }: UseInviteEmployeeProps = {}) => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: InviteEmployeeParams) => {
      const siteUrl = window.location.origin;
      const redirectUrl = params.redirectUrl || `${siteUrl}/set-password`;

      const { data, error } = await supabase.functions.invoke('invite-employee', {
        body: {
          email: params.email,
          firstName: params.firstName,
          lastName: params.lastName,
          phoneNumber: params.phoneNumber,
          team: params.team,
          address: params.address,
          zipcode: params.zipcode,
          country: params.country,
          city: params.city,
          employeeType: params.employeeType,
          hourlySalary: params.hourlySalary,
          employedPercentage: params.employedPercentage,
          socialSecurityNumber: params.socialSecurityNumber,
          accountNumber: params.accountNumber,
          paycheckSolution: params.paycheckSolution,
          redirectUrl: redirectUrl
        },
      });

      if (error) {
        console.error('Error inviting employee:', error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Employee invited',
        description: 'An invitation has been sent to the employee.',
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to invite employee: ${error.message}`,
        variant: 'destructive',
      });
      if (onError) onError(error);
    },
  });
};
