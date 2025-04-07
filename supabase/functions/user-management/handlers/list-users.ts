
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

export const handleListUsers = async (
  supabaseAdmin: SupabaseClient,
  corsHeaders: Record<string, string>
) => {
  console.log('Fetching users list');
  
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) throw error;
  
  console.log(`Retrieved ${data.users.length} users`);
  
  return new Response(
    JSON.stringify({ 
      users: data.users
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    }
  );
};
