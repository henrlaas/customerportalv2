
import { createEmailTransporter, sendEmail, EmailConfig, EmailContent } from './emailService';

// Default email configuration using the provided settings
const defaultEmailConfig: EmailConfig = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'noreply@box.no',
    pass: process.env.EMAIL_PASSWORD || '', // Password should be stored as an environment variable
  },
};

/**
 * Simplified function to send an email using specified configuration
 */
export const sendAppEmail = async (content: Omit<EmailContent, 'from'>) => {
  // In a production app, these should be loaded from environment variables
  // or Supabase secrets, not hardcoded
  const emailConfig: EmailConfig = {
    host: process.env.EMAIL_HOST || defaultEmailConfig.host,
    port: parseInt(process.env.EMAIL_PORT || defaultEmailConfig.port.toString()),
    secure: process.env.EMAIL_SECURE === 'false' ? false : defaultEmailConfig.secure,
    auth: {
      user: process.env.EMAIL_USER || defaultEmailConfig.auth.user,
      pass: process.env.EMAIL_PASSWORD || defaultEmailConfig.auth.pass,
    },
  };

  const transporter = createEmailTransporter(emailConfig);
  return sendEmail(transporter, {
    ...content,
    from: process.env.EMAIL_FROM || 'Box Workspace <noreply@box.no>'
  });
};

/**
 * Send a welcome email to a new user
 */
export const sendWelcomeEmail = async (to: string, firstName: string) => {
  return sendAppEmail({
    to,
    subject: 'Welcome to Box Workspace',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome, ${firstName}!</h1>
        <p>Thank you for joining Box Workspace. We're excited to have you on board.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br/>Box Workspace Team</p>
      </div>
    `,
    text: `Welcome, ${firstName}! Thank you for joining Box Workspace. We're excited to have you on board. If you have any questions, feel free to reach out to our support team. Best regards, Box Workspace Team`
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
        <p>Best regards,<br/>Box Workspace Team</p>
      </div>
    `,
    text: `New Task Assignment. You have been assigned a new task: ${taskName}. Please visit ${taskUrl} to view details. Please review and take appropriate action. Best regards, Box Workspace Team`
  });
};
