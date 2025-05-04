
import { createEmailTransporter, sendEmail, EmailConfig, EmailContent } from './emailService';

/**
 * Simplified function to send an email using environment variables for configuration
 * Note: In a real application, these would be loaded from environment variables
 * or your Supabase secrets.
 */
export const sendAppEmail = async (content: Omit<EmailContent, 'from'>) => {
  // In a production app, these should be loaded from environment variables
  // or Supabase secrets, not hardcoded
  const emailConfig: EmailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || 'user@example.com',
      pass: process.env.EMAIL_PASSWORD || 'password',
    },
  };

  const transporter = createEmailTransporter(emailConfig);
  return sendEmail(transporter, {
    ...content,
    from: process.env.EMAIL_FROM || 'noreply@yourdomain.com'
  });
};

/**
 * Send a welcome email to a new user
 */
export const sendWelcomeEmail = async (to: string, firstName: string) => {
  return sendAppEmail({
    to,
    subject: 'Welcome to Our Application',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome, ${firstName}!</h1>
        <p>Thank you for joining our application. We're excited to have you on board.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br/>The Team</p>
      </div>
    `,
    text: `Welcome, ${firstName}! Thank you for joining our application. We're excited to have you on board. If you have any questions, feel free to reach out to our support team. Best regards, The Team`
  });
};

/**
 * Send a notification email about a new task
 */
export const sendTaskNotificationEmail = async (to: string, taskName: string, taskUrl: string) => {
  return sendAppEmail({
    to,
    subject: `New Task Assigned: ${taskName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>New Task Assignment</h1>
        <p>You have been assigned a new task: <strong>${taskName}</strong></p>
        <p><a href="${taskUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">View Task</a></p>
        <p>Please review and take appropriate action.</p>
        <p>Best regards,<br/>The Team</p>
      </div>
    `,
    text: `New Task Assignment. You have been assigned a new task: ${taskName}. Please visit ${taskUrl} to view details. Please review and take appropriate action. Best regards, The Team`
  });
};
