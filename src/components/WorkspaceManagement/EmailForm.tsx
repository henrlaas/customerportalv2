
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
    
    // Create HTML email using the template from settings or fallback to default
    let htmlTemplate = emailTemplate;
    
    if (!htmlTemplate) {
      // Default template as fallback
      htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email from Box Workspace</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
        }
        .logo {
            text-align: center;
            padding: 20px 0;
        }
        .content {
            padding: 20px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #999999;
            border-top: 1px solid #eeeeee;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="https://shorturl.at/7WV73" alt="Box Marketing AS" width="150" />
        </div>
        <div class="content">
            <h2>Hello 👋</h2>
            <p>${data.message}</p>
            <p>Thank you,<br>The Box Team</p>
        </div>
        <div class="footer">
            <p>This email was sent to you because you have an association with Box Marketing AS.</p>
            <p>© 2025 Box Marketing AS. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
      `;
    } else {
      // Properly replace placeholders in the template
      // Use regex to ensure all instances are replaced
      htmlTemplate = htmlTemplate
        .replace(/\${data\.message}/g, data.message)
        .replace(/\${data\.subject}/g, data.subject);
    }

    // Generate a clean plain text version without HTML tags
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
      html: htmlTemplate,
      text: plainTextMessage
    };

    console.log("Sending email to:", data.to);
    console.log("Using template:", htmlTemplate.substring(0, 100) + "...");
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
