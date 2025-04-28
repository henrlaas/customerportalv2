
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
  team?: string;
  sendEmail?: boolean;
};

type UseInviteUserProps = {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
};

export const useInviteUser = ({ onSuccess, onError }: UseInviteUserProps = {}) => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: InviteUserParams) => {
      // Get the current URL for redirect
      const siteUrl = window.location.origin;
      const redirectUrl = params.redirect || `${siteUrl}/set-password`;

      console.log('Inviting user with params:', JSON.stringify({
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        phoneNumber: params.phoneNumber,
        role: params.role || 'client',
        language: params.language || 'en',
        redirect: redirectUrl,
        team: params.team,
        sendEmail: params.sendEmail !== false // Default to true if not specified
      }));

      const { data, error } = await supabase.functions.invoke('user-management', {
        body: {
          action: 'invite',
          email: params.email,
          firstName: params.firstName,
          lastName: params.lastName,
          phoneNumber: params.phoneNumber,
          role: params.role || 'client',
          language: params.language || 'en',
          redirect: redirectUrl,
          team: params.team,
          sendEmail: params.sendEmail !== false // Default to true if not specified
        },
      });

      if (error) {
        console.error('Error inviting user:', error);
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No data returned from invite function');
      }

      return data;
    },
    onSuccess: (data) => {
      const isNewUser = data.isNewUser !== false;
      toast({
        title: isNewUser ? 'User invited' : 'User updated',
        description: isNewUser ? 
          'An invitation has been sent to the user.' : 
          'The user has been updated and a reset email has been sent.',
      });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to invite user: ${error.message}`,
        variant: 'destructive',
      });
      if (onError) onError(error);
    },
  });
};
