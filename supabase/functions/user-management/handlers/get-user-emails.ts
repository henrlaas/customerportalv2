
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

export const handleGetUserEmails = async (
  body: any,
  supabaseAdmin: SupabaseClient,
  corsHeaders: Record<string, string>
) => {
  const { userIds } = body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return new Response(
      JSON.stringify({ error: 'User IDs array is required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  console.log(`Fetching emails for ${userIds.length} users`);

  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    const filteredUsers = data.users
      .filter(user => userIds.includes(user.id))
      .map(user => ({
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
      }));

    console.log(`Found ${filteredUsers.length} matching users`);

    return new Response(
      JSON.stringify(filteredUsers),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in getEmails:', error);
    
    return new Response(
      JSON.stringify({ error }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};
