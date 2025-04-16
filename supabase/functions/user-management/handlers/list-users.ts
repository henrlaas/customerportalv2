
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

export const handleListUsers = async (
  supabaseAdmin: SupabaseClient,
  corsHeaders: Record<string, string>
) => {
  console.log('Fetching users list');
  
  // First get users from auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authError) throw authError;
  
  // Then get profiles data
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, first_name, last_name, role, team, language, phone_number');
  
  if (profilesError) throw profilesError;
  
  // Merge users with their profiles
  const users = authData.users.map(user => {
    const profile = profiles?.find(p => p.id === user.id) || {};
    return {
      ...user,
      user_metadata: {
        ...user.user_metadata,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role,
        team: profile.team,
        language: profile.language,
        phone_number: profile.phone_number
      }
    };
  });
  
  console.log(`Retrieved ${users.length} users`);
  
  return new Response(
    JSON.stringify({ users }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    }
  );
};
