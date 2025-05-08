
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { sendAppEmail } from "../utils/email.ts";

export const handleResetPassword = async (
  body: any,
  origin: string,
  supabaseAdmin: SupabaseClient,
  corsHeaders: Record<string, string>
) => {
  const { email } = body;
  
  if (!email) {
    return new Response(
      JSON.stringify({ error: 'Email is required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  try {
    console.log(`Sending password reset email to ${email} with redirect to ${origin}/set-password?type=recovery`);
    
    // Use Supabase's built-in password reset functionality
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/set-password?type=recovery`,
    });

    if (error) {
      console.error("Password reset error:", error);
      throw error;
    }

    // If we get here, the password reset was successful
    console.log(`Password reset email sent successfully to ${email}`);
    
    return new Response(
      JSON.stringify({ 
        message: `Password reset email sent to ${email}` 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error sending password reset email:", error);
    
    return new Response(
      JSON.stringify({ 
        error: `Failed to send password reset email: ${error.message || "Unknown error"}` 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};
