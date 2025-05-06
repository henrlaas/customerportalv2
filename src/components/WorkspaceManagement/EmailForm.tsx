
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail } from "lucide-react";
import { useEmailSender, EmailData } from "@/hooks/useEmailSender";
import { workspaceService } from "@/services/workspaceService";

interface EmailFormValues {
  to: string;
  subject: string;
  message: string;
}

export const EmailForm = () => {
  const [isSending, setIsSending] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState<string | null>(null);
  
  const form = useForm<EmailFormValues>({
    defaultValues: {
      to: "",
      subject: "",
      message: ""
    }
  });

  // Fetch the email template from workspace settings
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const settings = await workspaceService.getSettings();
        const templateSetting = settings.find(s => s.setting_key === 'email.template.default');
        if (templateSetting) {
          setEmailTemplate(templateSetting.setting_value);
        }
      } catch (error) {
        console.error("Failed to load email template:", error);
      }
    };

    fetchTemplate();
  }, []);

  const { mutate: sendEmail } = useEmailSender({
    onSuccess: () => {
      console.log("Email sent successfully");
      setIsSending(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Error sending email:", error);
      setIsSending(false);
    },
  });

  const onSubmit = (data: EmailFormValues) => {
    setIsSending(true);
    
    // Create HTML email using the template from settings or fallback to a basic template
    let htmlContent = '';
    
    if (emailTemplate) {
      // Replace template variables with actual content
      htmlContent = emailTemplate
        .replace(/\${data\.message}/g, data.message.replace(/\n/g, '<br>'))
        .replace(/\${data\.subject}/g, data.subject);
    } else {
      // Simple fallback template
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${data.subject}</title>
        </head>
        <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Hello 👋</h2>
                <div style="margin: 20px 0;">
                    ${data.message.replace(/\n/g, '<br>')}
                </div>
                <p>Thank you,<br>The Box Team</p>
                <hr style="margin-top: 20px; border: 0; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #666;">
                    This email was sent to you because you have an association with Box Marketing AS.<br>
                    © 2025 Box Marketing AS. All rights reserved.
                </p>
            </div>
        </body>
        </html>
      `.trim();
    }

    // Generate a clean plain text version
    const plainTextMessage = `
Hello 👋

${data.message}

Thank you,
The Box Team

This email was sent to you because you have an association with Box Marketing AS.
© 2025 Box Marketing AS. All rights reserved.
    `.trim();

    const emailData: EmailData = {
      to: data.to,
      subject: data.subject,
      html: htmlContent,
      text: plainTextMessage
    };

    console.log("Sending email to:", data.to);
    console.log("Email template being used:", htmlContent.substring(0, 100) + "...");
    sendEmail(emailData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="to"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="recipient@example.com" 
                  {...field}
                  type="email"
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Email subject" 
                  {...field}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Write your email message here..." 
                  className="min-h-[200px]"
                  {...field}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isSending}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Mail className="h-4 w-4" />
          {isSending ? "Sending..." : "Send Email"}
        </Button>
      </form>
    </Form>
  );
};
