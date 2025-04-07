
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

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

  // Update password reset to pass the type=recovery parameter
  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/set-password?type=recovery`,
  });

  if (error) throw error;

  return new Response(
    JSON.stringify({ 
      message: `Password reset email sent to ${email}` 
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    }
  );
};
