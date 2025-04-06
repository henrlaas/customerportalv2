
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
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse request body and extract action
    const body = await req.json();
    const { action } = body;

    // Invite User Operation
    if (action === 'invite') {
      const { email, firstName, lastName, role, team } = body;
      
      console.log(`Inviting user: ${email} with role: ${role}`);

      // Validate inputs
      if (!email || !role) {
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
          first_name: firstName || '',
          last_name: lastName || '',
          role: role,
          team: team || '',
        },
      });

      if (error) throw error;

      console.log('User invited successfully:', data);

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
    }
    
    // Delete User Operation
    else if (action === 'delete') {
      const { userId } = body;
      
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'User ID is required' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          message: 'User deleted successfully' 
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
    
    // Password Reset Operation
    else if (action === 'resetPassword') {
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

      const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: `${req.headers.get('origin')}/auth?reset=true`,
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
    }
    
    // Unsupported operation
    else {
      return new Response(
        JSON.stringify({ error: 'Unsupported operation' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

  } catch (error) {
    console.error('Error in user-management function:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
