
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type InviteUserParams = {
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string; 
  role?: string;
  language?: string;
  redirect?: string;
  team?: string; // Add team as an optional parameter
};

type UseInviteUserProps = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

export const useInviteUser = ({ onSuccess, onError }: UseInviteUserProps = {}) => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: InviteUserParams) => {
      // Get the current URL for redirect
      const siteUrl = window.location.origin;
      const redirectUrl = params.redirect || `${siteUrl}/set-password`;

      // Log the parameters being sent to the edge function
      console.log('Inviting user with params:', {
        action: 'invite',
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        phoneNumber: params.phoneNumber,
        role: params.role || 'client',
        team: params.team,
      });

      const { data, error } = await supabase.functions.invoke('user-management', {
        body: {
          action: 'invite', // Using 'invite' to match handler expectation
          email: params.email,
          firstName: params.firstName,
          lastName: params.lastName,
          phoneNumber: params.phoneNumber,
          role: params.role || 'client',
          language: params.language || 'en',
          redirect: redirectUrl,
          team: params.team, // Forward team parameter to the edge function
        },
      });

      if (error) {
        console.error('Error inviting user:', error);
        throw error;
      }

      // If the edge function returns an error in the data object
      if (data && data.error) {
        console.error('Error from edge function:', data.error);
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'User invited',
        description: 'An invitation has been sent to the user.',
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      let errorMessage = error.message;
      
      // Check if it's a duplicate email error
      if (errorMessage.includes('already exists')) {
        errorMessage = 'A user with this email address already exists.';
      }
      
      toast({
        title: 'Error',
        description: `Failed to invite user: ${errorMessage}`,
        variant: 'destructive',
      });
      if (onError) onError(error);
    },
  });
};
