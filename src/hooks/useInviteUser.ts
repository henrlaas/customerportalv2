
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { InviteUserFormValues } from '@/schemas/userSchemas';

interface UseInviteUserProps {
  onSuccess?: () => void;
}

export function useInviteUser({ onSuccess }: UseInviteUserProps = {}) {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InviteUserFormValues) => {
      const response = await supabase.functions.invoke('user-management', {
        body: {
          action: 'invite',
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          team: data.team,
          language: data.language,
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Error inviting user');
      }

      return response.data;
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Success',
        description: `Invitation sent to ${variables.email}`,
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
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
