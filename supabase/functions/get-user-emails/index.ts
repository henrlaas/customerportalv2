
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase admin client for server operations
const createAdminClient = () => {
  return createClient(
    Deno.env.get('NEW_SUPABASE_URL') ?? '',
    Deno.env.get('NEW_SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Get user emails function called');
    
    // Parse request body
    const { userIds } = await req.json()
    console.log('Requested user IDs:', userIds);

    // Validate request
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      console.error('Invalid userIds provided:', userIds);
      return new Response(
        JSON.stringify({ error: 'userIds array is required and must not be empty' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      )
    }

    // Create admin client to access auth.users
    const supabaseAdmin = createAdminClient()
    
    // Get users by IDs using admin client
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    console.log('Fetched users count:', users?.users?.length || 0);

    // Filter users by requested IDs and extract email information
    const emailData = users.users
      .filter(user => userIds.includes(user.id))
      .map(user => ({
        id: user.id,
        email: user.email || ''
      }));

    console.log('Filtered email data:', emailData);

    return new Response(
      JSON.stringify(emailData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in get-user-emails function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})
