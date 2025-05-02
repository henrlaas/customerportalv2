
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
    const { email, firstName, lastName } = await req.json();

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

    console.log(`Inviting employee: ${email} with name: ${firstName} ${lastName}`);

    // Get site URL for redirect
    const origin = req.headers.get('origin') || 'https://vjqbgnjeuvuxvuruewyc.supabase.co';
    const redirectUrl = `${origin}/set-password`;

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    
    if (fetchError && fetchError.message !== 'User not found') {
      console.error('Error checking for existing user:', fetchError);
      throw fetchError;
    }
    
    let userData;
    
    if (existingUser) {
      console.log('User already exists, returning existing user data');
      userData = existingUser;
    } else {
      // Invite the user using the admin API
      const { data: newUser, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'employee',
        },
      });

      if (inviteError) {
        console.error('Error inviting employee:', inviteError);
        throw inviteError;
      }

      console.log('Employee invited successfully:', newUser);
      userData = newUser;
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        message: `Invitation sent to ${email}`,
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
