
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

export const handleListUsers = async (
  supabaseAdmin: SupabaseClient,
  corsHeaders: Record<string, string>
) => {
  console.log('Fetching users list');
  
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) throw error;
  
  console.log(`Retrieved ${data.users.length} users`);
  
  // Make sure user_metadata contains display_name
  const usersWithDisplayName = data.users.map(user => {
    if (!user.user_metadata) {
      user.user_metadata = {};
    }
    
    // If display_name isn't set, derive it from the email
    if (!user.user_metadata.display_name) {
      user.user_metadata.display_name = user.email ? user.email.split('@')[0] : 'User';
    }
    
    return user;
  });
  
  return new Response(
    JSON.stringify({ 
      users: usersWithDisplayName
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    }
  );
};
