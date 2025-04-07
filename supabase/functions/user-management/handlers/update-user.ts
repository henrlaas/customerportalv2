
import { corsHeaders } from "../utils/cors.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

export const handleUpdateUser = async (
  body: { userId: string; userData: any },
  supabaseAdmin: SupabaseClient,
  corsHeaders: Record<string, string>
) => {
  const { userId, userData } = body;

  if (!userId || !userData) {
    return new Response(
      JSON.stringify({ error: 'User ID and user data are required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  try {
    console.log(`Updating user: ${userId} with data:`, userData);

    // Update the user in Supabase Auth
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      userData
    );

    if (updateError) {
      console.error(`Error updating user: ${updateError.message}`);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({
        user: updateData.user,
        message: "User updated successfully"
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error(`Error in handleUpdateUser: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};
