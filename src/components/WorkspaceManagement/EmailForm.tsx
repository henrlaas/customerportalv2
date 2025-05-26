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

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Box Workspace</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin: 0 auto;">
                    <tr>
                        <td style="text-align: center; padding: 20px 0;">
                            <img src="https://shorturl.at/7WV73" alt="Box Marketing AS" width="150" style="display: block; margin: 0 auto;" />
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px;">
                            <h2 style="color: #004743; margin: 0 0 20px 0; font-size: 24px;">Hello 👋</h2>
                            <div style="margin-bottom: 20px; white-space: pre-wrap;">\${data.message}</div>
                            <p style="margin: 20px 0;">Thank you,<br>The Box Team</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; padding: 20px; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0 0 10px 0;">This email was sent to you because you have an association with Box Marketing AS.</p>
                            <p style="margin: 0;">© 2025 Box Marketing AS. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

export const EmailForm = () => {
  const [isSending, setIsSending] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState<string | null>(null);
  const [templateLoading, setTemplateLoading] = useState(true);
  const [templateError, setTemplateError] = useState<string | null>(null);
  
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
        setTemplateLoading(true);
        setTemplateError(null);
        const settings = await workspaceService.getSettings();
        const templateSetting = settings.find(s => s.setting_key === 'email.template.default');
        
        if (templateSetting && templateSetting.setting_value) {
          setEmailTemplate(templateSetting.setting_value);
          console.log("Custom email template loaded successfully");
        } else {
          setEmailTemplate(DEFAULT_TEMPLATE);
          console.log("Using default email template");
        }
      } catch (error) {
        console.error("Failed to load email template:", error);
        setTemplateError("Failed to load custom template");
        setEmailTemplate(DEFAULT_TEMPLATE);
      } finally {
        setTemplateLoading(false);
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

  // Function to properly escape HTML and handle line breaks
  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  };

  // Function to process template with proper variable replacement
  const processTemplate = (template: string, data: { message: string; subject: string }) => {
    let processedTemplate = template;
    
    // Replace template variables with proper HTML escaping
    processedTemplate = processedTemplate.replace(/\$\{data\.message\}/g, escapeHtml(data.message));
    processedTemplate = processedTemplate.replace(/\$\{data\.subject\}/g, escapeHtml(data.subject));
    
    return processedTemplate;
  };

  const onSubmit = (data: EmailFormValues) => {
    if (templateLoading) {
      console.warn("Template still loading, please wait");
      return;
    }

    setIsSending(true);
    
    // Use the loaded template or fallback to default
    const templateToUse = emailTemplate || DEFAULT_TEMPLATE;
    
    // Process the template with data
    const htmlContent = processTemplate(templateToUse, {
      message: data.message,
      subject: data.subject
    });

    // Generate a clean plain text version
    const plainTextMessage = `Hello 👋

${data.message}

Thank you,
The Box Team

This email was sent to you because you have an association with Box Marketing AS.
© 2025 Box Marketing AS. All rights reserved.`;

    const emailData: EmailData = {
      to: data.to,
      subject: data.subject,
      html: htmlContent,
      text: plainTextMessage
    };

    console.log("Sending email to:", data.to);
    console.log("Using template:", templateError ? "default (due to error)" : "loaded template");
    console.log("HTML content preview:", htmlContent.substring(0, 200) + "...");
    
    sendEmail(emailData);
  };

  if (templateLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading email template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {templateError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ {templateError}. Using default template instead.
          </p>
        </div>
      )}
      
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
            disabled={isSending || templateLoading}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Mail className="h-4 w-4" />
            {isSending ? "Sending..." : "Send Email"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
