
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createAdminClient } from "./supabase.ts"

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse the incoming request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Error parsing request JSON:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    const { email, redirectUrl } = body;
    
    if (!email) {
      console.error('Missing required field: email');
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();
    
    // Get the origin for redirects if not provided
    const origin = redirectUrl || req.headers.get('origin') || 'http://localhost:3000';
    
    console.log(`Sending password reset email to: ${email}`);
    console.log(`Redirect URL: ${origin}/set-password?type=invite`);
    
    // Send the password reset email with a specific redirect URL that includes the "type=invite" parameter
    const { error, data } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/set-password?type=invite`,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      );
    }

    console.log('Password reset email sent successfully');
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Password reset email sent to ${email}`,
        data 
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
    );
  } catch (error) {
    console.error('Error in inviteEmployeeResetPassword function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        success: false
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    );
  }
});
