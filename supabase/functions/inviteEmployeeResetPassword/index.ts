
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createAdminClient } from "../user-management/utils/supabase.ts"

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
    const { email, redirectUrl } = await req.json()
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()
    
    // Get the origin for redirects if not provided
    const origin = redirectUrl || req.headers.get('origin') || 'http://localhost:3000'
    
    console.log(`Sending password reset email to: ${email}`)
    console.log(`Redirect URL: ${origin}/set-password?type=invite`)
    
    // Send the password reset email with a specific redirect URL that includes the "type=invite" parameter
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/set-password?type=invite`,
    })

    if (error) {
      console.error('Error sending password reset email:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Password reset email sent to ${email}` 
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 200 }
    )
  } catch (error) {
    console.error('Error in inviteEmployeeResetPassword function:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders }, status: 500 }
    )
  }
})
