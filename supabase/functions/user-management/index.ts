
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from './utils/cors.ts'
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
    const body = await req.json()
    const { action } = body

    switch(action) {
      case 'invite':
        return await handleInviteUser(req)
      case 'update':
        return await handleUpdateUser(req)
      case 'delete':
        return await handleDeleteUser(req)
      case 'list':
        return await handleListUsers(req)
      case 'reset-password':
        return await handleResetPassword(req)
      case 'get-user-emails':
        return await handleGetUserEmails(req)
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
