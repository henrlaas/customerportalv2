
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useEmailSender } from "@/hooks/useEmailSender";
import { EmailData } from "@/hooks/useEmailSender";

interface TestEmailButtonProps {
  recipientEmail?: string;
}

export const TestEmailButton = ({ recipientEmail = "henrik@box.no" }: TestEmailButtonProps) => {
  const [isSending, setIsSending] = useState(false);
  const { mutate: sendEmail } = useEmailSender({
    onSuccess: () => setIsSending(false),
    onError: () => setIsSending(false),
  });

  const handleSendTestEmail = () => {
    setIsSending(true);
    
    const emailData: EmailData = {
      to: recipientEmail,
      subject: "Test Email from Box Workspace",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Test Email</h1>
          <p>This is a test email from the Box Workspace management system.</p>
          <p>If you're receiving this, the email integration is working correctly.</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
          <p>Best regards,<br/>Box Workspace Team</p>
        </div>
      `,
      text: "This is a test email from the Box Workspace management system. If you're receiving this, the email integration is working correctly."
    };

    sendEmail(emailData);
  };

  return (
    <Button 
      onClick={handleSendTestEmail} 
      disabled={isSending}
      className="flex items-center gap-2"
    >
      <Mail className="h-4 w-4" />
      {isSending ? "Sending..." : "Send Test Email"}
    </Button>
  );
};
