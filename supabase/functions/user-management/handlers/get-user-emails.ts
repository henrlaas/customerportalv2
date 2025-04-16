
import { corsHeaders } from '../utils/cors.ts'
import { createAdminClient } from '../utils/supabase.ts'

// Handler for getting emails for a list of user IDs
export async function handleGetUserEmails(req: Request) {
  try {
    const { userIds } = await req.json()
    
    if (!Array.isArray(userIds)) {
      return new Response(
        JSON.stringify({ error: 'userIds must be an array' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Get admin supabase client
    const supabase = createAdminClient()

    // Get user role to determine permission
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: userError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const userId = userData.user?.id
    
    // Get user role
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
      
    const isAdminOrEmployee = profileData?.role === 'admin' || profileData?.role === 'employee'
    
    let filteredUserIds = userIds
    
    // If not admin/employee, only allow access to their own email
    if (!isAdminOrEmployee) {
      filteredUserIds = userIds.filter(id => id === userId)
    }
    
    // If no valid IDs after filtering, return empty array
    if (filteredUserIds.length === 0) {
      return new Response(
        JSON.stringify([]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Query users table securely using admin client
    const { data, error } = await supabase.auth.admin.listUsers({
      filter: {
        id: {
          in: filteredUserIds.join(',')
        }
      }
    })
    
    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users', details: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Map to return only id and email
    const emails = data?.users.map(user => ({
      id: user.id,
      email: user.email
    })) || []
    
    return new Response(
      JSON.stringify(emails),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}
