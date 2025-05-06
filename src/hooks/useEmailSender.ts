
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface EmailData {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string;  // Base64 encoded content
    contentType?: string;
  }>;
}

interface UseEmailSenderOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useEmailSender = (options?: UseEmailSenderOptions) => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (emailData: EmailData) => {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData,
      });
      
      if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }
      
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Your email was sent successfully.",
      });
      
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Email Failed",
        description: error.message,
        variant: "destructive",
      });
      
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};
