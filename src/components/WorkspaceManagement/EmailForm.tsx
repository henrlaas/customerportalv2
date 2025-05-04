
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
    
    const emailData: EmailData = {
      to: data.to,
      subject: data.subject,
      html: data.message,
      text: data.message.replace(/<[^>]*>/g, '') // Strip HTML for plain text version
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
