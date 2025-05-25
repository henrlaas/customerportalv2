
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from './utils/cors.ts'
import { createAdminClient } from './utils/supabase.ts'
import { handleInviteUser } from './handlers/invite-user.ts'
import { handleUpdateUser } from './handlers/update-user.ts'
import { handleDeleteUser } from './handlers/delete-user.ts'
import { handleListUsers } from './handlers/list-users.ts'
import { handleResetPassword } from './handlers/reset-password.ts'
import { handleGetUserEmails } from './handlers/get-user-emails.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Clone the request to avoid body consumption issues
    const reqClone = req.clone();
    const body = await req.json()
    const { action } = body
    const supabaseAdmin = createAdminClient()

    // Get origin for redirects
    const origin = req.headers.get('origin') || 'http://localhost:3000'
    
    console.log(`Processing action: ${action}`);
    
    switch(action) {
      case 'invite':
      case 'invite-user': // Handle both 'invite' and 'invite-user' for backward compatibility
        return await handleInviteUser(body, origin, supabaseAdmin, corsHeaders)
      case 'update':
        return await handleUpdateUser(body, supabaseAdmin, corsHeaders)
      case 'delete':
        return await handleDeleteUser(body, supabaseAdmin, corsHeaders)
      case 'list':
        return await handleListUsers(supabaseAdmin, corsHeaders)
      case 'resetPassword':
      case 'reset-password':
        return await handleResetPassword(body, origin, supabaseAdmin, corsHeaders)
      case 'get-user-emails':
        // Pass the cloned request to avoid body consumption issues
        return await handleGetUserEmails(reqClone)
      default:
        console.error(`Unknown action: ${action}`);
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
