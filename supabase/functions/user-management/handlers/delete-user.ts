
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

export const handleDeleteUser = async (
  body: any,
  supabaseAdmin: SupabaseClient,
  corsHeaders: Record<string, string>
) => {
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
};
