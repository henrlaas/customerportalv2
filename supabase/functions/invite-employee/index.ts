
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
    const { 
      email, 
      firstName, 
      lastName, 
      phoneNumber,
      team,
      role = 'employee',
    } = await req.json();

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

    // Get site URL for redirect
    const origin = req.headers.get('origin') || 'https://vjqbgnjeuvuxvuruewyc.supabase.co';
    const redirectUrl = `${origin}/set-password`;
    
    console.log(`Processing invite request for email: ${email}`);
    
    // User metadata for profile
    const userMetadata = {
      first_name: firstName || '',
      last_name: lastName || '',
      role: role,
    };
    
    // Check if user already exists
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: email,
      },
    });
    
    if (listError) {
      console.error('Error checking existing users:', listError);
      throw listError;
    }
      
    // Find the user with matching email
    let existingUser = users && users.length > 0 ? users[0] : null;
    let userData;
    let emailError;
    
    // User already exists scenario
    if (existingUser) {
      console.log('User already exists, sending recovery email');
      userData = {
        user: existingUser
      };
      
      // Send recovery email (as invitation)
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
          emailError = resetError.message;
        } else {
          console.log('Invitation email sent successfully to existing user:', email);
        }
      } catch (error) {
        console.error('Exception sending invitation to existing user:', error);
        emailError = error.message || 'Unknown error';
      }
    } 
    // User doesn't exist - create new user and send invitation
    else {
      try {
        // Create the user account with metadata
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          email_confirm: true,
          user_metadata: userMetadata,
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
        
        // Update or create profile with firstName, lastName, phoneNumber, and team
        if (userData.user && userData.user.id) {
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({ 
              id: userData.user.id,
              first_name: firstName || null,
              last_name: lastName || null,
              phone_number: phoneNumber || null,
              role: role,
              team: team || null
            });
            
          if (profileError) {
            console.error('Error updating profile:', profileError);
            // We continue despite profile error as user is already created
          }
        }
        
        // Send invitation email
        const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: email,
          options: {
            redirectTo: redirectUrl,
          }
        });

        if (resetError) {
          console.error('Error sending invitation email:', resetError);
          emailError = resetError.message;
        } else {
          console.log('Invitation email sent successfully to:', email);
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

    // If we've made it here, we have user data to return
    // Even if there was an email error, we can still return success with a warning
    return new Response(
      JSON.stringify({ 
        data: userData,
        emailError: emailError 
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
