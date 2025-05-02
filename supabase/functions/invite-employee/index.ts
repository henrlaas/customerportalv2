
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
    const { email, checkOnly } = await req.json();

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

    console.log(`Processing ${checkOnly ? 'check' : 'invite'} request for email: ${email}`);

    // Get site URL for redirect
    const origin = req.headers.get('origin') || 'https://vjqbgnjeuvuxvuruewyc.supabase.co';
    const redirectUrl = `${origin}/set-password`;

    // Check if user already exists using admin API
    let existingUser;
    
    try {
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        throw listError;
      }
      
      // Find the user with matching email
      existingUser = users.users.find(user => user.email === email);
    } catch (error) {
      console.error('Error listing users:', error);
      return new Response(
        JSON.stringify({ error: `Error checking user: ${error.message || error}` }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
    
    let userData;
    let statusMessage;
    
    // User already exists scenario
    if (existingUser) {
      console.log('User already exists, returning existing user data');
      userData = existingUser;
      statusMessage = `User with email ${email} already exists`;
      
      if (checkOnly) {
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
      }
      
      // If not just checking and user exists, send recovery email (as invitation)
      try {
        const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: email,
          options: {
            redirectTo: redirectUrl,
          }
        });

        if (resetError) {
          console.error('Error sending invitation email to existing user:', resetError);
          return new Response(
            JSON.stringify({ 
              message: `User exists, but invitation email failed: ${resetError.message}`,
              data: userData,
              emailError: resetError.message
            }),
            {
              status: 200, // Still return 200 since we're returning user data
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        } else {
          console.log('Invitation email sent successfully to existing user:', email);
          statusMessage = `User exists and invitation sent to ${email}`;
        }
      } catch (error) {
        console.error('Exception sending invitation to existing user:', error);
        return new Response(
          JSON.stringify({ 
            message: `User exists, but invitation failed: ${error.message || error}`,
            data: userData,
            emailError: error.message || 'Unknown error'
          }),
          {
            status: 200, // Still return 200 since we're returning user data
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
    } 
    // User doesn't exist - we'll create a new user and then send an invitation
    else {
      if (checkOnly) {
        return new Response(
          JSON.stringify({ 
            message: "User does not exist",
            error: "User does not exist"
          }),
          {
            status: 404, // Return 404 since the user doesn't exist
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      try {
        // First, create the user account without sending an automatic invite
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          email_confirm: true, // Mark email as confirmed
          user_metadata: {
            role: 'employee',
          },
        });

        if (createError) {
          console.error('Error creating employee account:', createError);
          return new Response(
            JSON.stringify({ error: createError.message || 'Failed to create employee account' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }

        console.log('Employee account created successfully:', newUser);
        userData = newUser;
        
        // Now that the user is created, send a password reset email which acts as our invitation
        const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: email,
          options: {
            redirectTo: redirectUrl,
          }
        });

        if (resetError) {
          console.error('Error sending invitation email:', resetError);
          // We don't want to fail the entire process if just the email fails
          // The user account is created, we just couldn't send the invite
          return new Response(
            JSON.stringify({ 
              message: `Employee account created, but invitation email failed: ${resetError.message}`,
              data: userData,
              emailError: resetError.message
            }),
            {
              status: 200, // Still return 200 since the user was created
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        } else {
          console.log('Invitation email sent successfully to:', email);
          statusMessage = `Employee account created and invitation sent to ${email}`;
        }
      } catch (error) {
        console.error('Unexpected error during employee creation or invitation:', error);
        return new Response(
          JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
    }

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
