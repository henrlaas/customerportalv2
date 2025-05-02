
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { email } = await req.json();

    // Validation
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create a Supabase client with the service role key (admin privileges)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log(`Inviting employee with email: ${email}`);

    // Get site URL for redirect
    const origin = req.headers.get('origin') || 'https://vjqbgnjeuvuxvuruewyc.supabase.co';
    const redirectUrl = `${origin}/set-password`;

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    
    if (fetchError) {
      // Only throw if it's not a "user not found" error
      if (fetchError.message !== 'User not found') {
        console.error('Error checking for existing user:', fetchError);
        throw new Error(`Error checking user: ${fetchError.message}`);
      }
    }
    
    let userData;
    let statusMessage;
    
    if (existingUser) {
      console.log('User already exists, returning existing user data');
      userData = existingUser;
      statusMessage = `User with email ${email} already exists, no invitation needed`;
    } else {
      // Invite the user using the admin API
      try {
        const { data: newUser, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          redirectTo: redirectUrl,
          data: {
            role: 'employee',
          },
        });

        if (inviteError) {
          console.error('Error inviting employee:', inviteError);
          return new Response(
            JSON.stringify({ error: inviteError.message || 'Failed to invite employee' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }

        console.log('Employee invited successfully:', newUser);
        userData = newUser;
        statusMessage = `Invitation sent to ${email}`;
      } catch (inviteError) {
        console.error('Unexpected error during invitation:', inviteError);
        return new Response(
          JSON.stringify({ error: inviteError.message || 'An unexpected error occurred during invitation' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        message: statusMessage,
        data: userData 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error in invite-employee function:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
