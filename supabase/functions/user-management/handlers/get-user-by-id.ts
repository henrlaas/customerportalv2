
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

export const handleGetUserById = async (
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

  try {
    // Use the admin client to get the user by ID
    const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error) {
      console.error('Error fetching user by ID:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Return just the necessary user information
    return new Response(
      JSON.stringify({ 
        email: user.user.email,
        id: user.user.id
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in handleGetUserById:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred fetching user' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};
