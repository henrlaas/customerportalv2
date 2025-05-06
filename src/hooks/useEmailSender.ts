
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
      console.log("Sending email with data:", {
        to: emailData.to,
        subject: emailData.subject,
        htmlLength: emailData.html ? emailData.html.length : 0,
        textLength: emailData.text ? emailData.text.length : 0
      });
      
      // Make sure we're sending properly structured data to the edge function
      const cleanedData = {
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text || undefined,
        html: emailData.html || undefined,
        cc: emailData.cc || undefined,
        bcc: emailData.bcc || undefined,
        attachments: emailData.attachments || undefined,
      };
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: cleanedData,
      });
      
      if (error) {
        console.error("Supabase function error:", error);
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
      console.error("Email sending error:", error);
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
