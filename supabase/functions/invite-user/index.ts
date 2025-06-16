
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    // Create a Supabase client with the service role key (has admin privileges)
    const supabaseAdmin = createClient(
      Deno.env.get('NEW_SUPABASE_URL') ?? '',
      Deno.env.get('NEW_SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse request body
    const { email, firstName, lastName, role } = await req.json();

    console.log(`Inviting user: ${email} with role: ${role}`);

    // Validate inputs
    if (!email || !firstName || !lastName || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Verify the role is valid
    if (!['admin', 'employee', 'client'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Invite the user using the admin API
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: role,
      },
    });

    if (error) {
      throw error;
    }

    console.log('User invited successfully:', data);

    // Return success response
    return new Response(
      JSON.stringify({ 
        message: `Invitation sent to ${email}`,
        data: data 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error inviting user:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
