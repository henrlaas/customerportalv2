
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
    const { data, error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/set-password?type=recovery`,
    });

    if (error) {
      // Log the specific error details to help with debugging
      console.error("Password reset error details:", error.message, error.status, error.name);
      
      // Return a specific error response with a 400 status code for client-side errors
      return new Response(
        JSON.stringify({ 
          error: `Failed to send password reset: ${error.message}`,
          details: {
            status: error.status,
            name: error.name
          }
        }),
        {
          status: error.status || 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // If we reach this point, Supabase has sent the password reset email
    console.log(`Password reset email sent successfully to ${email}`);
    
    // Return a success response
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
    
    // Return a more detailed error response
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
