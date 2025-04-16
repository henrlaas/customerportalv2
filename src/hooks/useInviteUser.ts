
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { InviteUserFormValues } from '@/schemas/userSchemas';

interface UseInviteUserProps {
  onSuccess?: (data?: any) => void;
}

export function useInviteUser({ onSuccess }: UseInviteUserProps = {}) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InviteUserFormValues) => {
      console.log('Inviting user with data:', data);
      
      const response = await supabase.functions.invoke('user-management', {
        body: {
          action: 'invite',
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role || 'client',
          team: data.team,
          language: data.language || 'en',
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Error inviting user');
      }

      return response.data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: 'Success',
        description: `Invitation sent to ${variables.email}`,
      });
      
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
}
