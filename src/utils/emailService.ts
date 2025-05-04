
import nodemailer from 'nodemailer';

// Email configuration types
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  }
}

// Email content interface
export interface EmailContent {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Creates a configured email transporter
 * @param config Email server configuration
 * @returns Configured nodemailer transporter
 */
export const createEmailTransporter = (config: EmailConfig) => {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.auth.user,
      pass: config.auth.pass,
    },
  });
};

/**
 * Sends an email using the provided transporter and content
 * @param transporter Nodemailer transporter instance
 * @param content Email content including recipients, subject, and body
 * @returns Promise resolving to the send info
 */
export const sendEmail = async (
  transporter: nodemailer.Transporter,
  content: EmailContent
) => {
  try {
    const info = await transporter.sendMail({
      from: content.from || `"ACRM System" <${transporter.options.auth?.user}>`,
      to: Array.isArray(content.to) ? content.to.join(', ') : content.to,
      cc: content.cc ? (Array.isArray(content.cc) ? content.cc.join(', ') : content.cc) : undefined,
      bcc: content.bcc ? (Array.isArray(content.bcc) ? content.bcc.join(', ') : content.bcc) : undefined,
      subject: content.subject,
      text: content.text,
      html: content.html,
      attachments: content.attachments,
    });
    
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId, info };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};
