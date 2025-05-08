// This is a placeholder function since the actual email sending is handled by Supabase Auth
// for password resets. But we keep this here for potential custom emails in the future.
export const sendAppEmail = async (
  to: string, 
  subject: string, 
  html: string
): Promise<boolean> => {
  console.log(`[Mock Email] Would send email to: ${to}, subject: ${subject}`);
  // For actual email sending implementation, you'd use SMTP or a service like SendGrid
  return true;
};
