
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail } from "lucide-react";
import { useEmailSender, EmailData } from "@/hooks/useEmailSender";

interface EmailFormValues {
  to: string;
  subject: string;
  message: string;
}

export const EmailForm = () => {
  const [isSending, setIsSending] = useState(false);
  const form = useForm<EmailFormValues>({
    defaultValues: {
      to: "",
      subject: "",
      message: ""
    }
  });

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
    
    // Create HTML email using the template
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Box Workspace</title>
    <style>
        :root {
            --forest-green: #004743;
            --evergreen: #004743;
            --minty: #E4EDED;
        }
        
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
        
        h1 {
            color: #333333;
            margin-top: 0;
        }
        
        p {
            margin-bottom: 20px;
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .primary-button {
            border: 2px none var(--forest-green);
            background-color: var(--evergreen);
            color: var(--minty);
            text-align: center;
            letter-spacing: -.18px;
            object-fit: fill;
            border-radius: 15px;
            flex: 0 auto;
            justify-content: center;
            align-items: center;
            padding: 14px 32px;
            font-family: 'Arial', sans-serif;
            font-size: 18px;
            font-weight: 500;
            transition: color .2s cubic-bezier(.68, -.55, .265, 1.55);
            display: inline-flex;
            position: relative;
            overflow: hidden;
            text-decoration: none;
        }
        
        .features {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            margin: 30px 0;
        }
        
        .feature {
            flex-basis: 30%;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .feature-icon {
            font-size: 24px;
            margin-bottom: 10px;
            color: var(--evergreen);
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #999999;
            border-top: 1px solid #eeeeee;
            margin-top: 20px;
        }
        
        .social {
            margin: 15px 0;
        }
        
        .social a {
            display: inline-block;
            margin: 0 10px;
            color: #666666;
            text-decoration: none;
        }
        
        @media only screen and (max-width: 600px) {
            .container {
                width: 100%;
            }
            
            .feature {
                flex-basis: 100%;
            }
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

    const emailData: EmailData = {
      to: data.to,
      subject: data.subject,
      html: htmlTemplate
    };

    console.log("Sending email to:", data.to);
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
