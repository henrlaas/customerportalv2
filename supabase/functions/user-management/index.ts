
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { handleListUsers } from "./handlers/list-users.ts";
import { handleInviteUser } from "./handlers/invite-user.ts";
import { handleDeleteUser } from "./handlers/delete-user.ts";
import { handleResetPassword } from "./handlers/reset-password.ts";
import { createAdminClient } from "./utils/supabase.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createAdminClient();
    
    // Parse request body and extract action
    const body = await req.json();
    const { action } = body;
    
    // Extract origin for redirect URLs
    const origin = req.headers.get('origin') || 'https://customerportalv2.lovable.app';
    console.log('Using origin for redirects:', origin);

    switch (action) {
      case 'list':
        return handleListUsers(supabaseAdmin, corsHeaders);
        
      case 'invite':
        return handleInviteUser(body, origin, supabaseAdmin, corsHeaders);
        
      case 'delete':
        return handleDeleteUser(body, supabaseAdmin, corsHeaders);
        
      case 'resetPassword':
        return handleResetPassword(body, origin, supabaseAdmin, corsHeaders);
        
      default:
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
