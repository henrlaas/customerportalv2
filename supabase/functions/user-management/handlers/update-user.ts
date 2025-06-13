
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

    // If user_metadata.phone_number exists, update the phone_number in profiles table as well
    if (userData.user_metadata && userData.user_metadata.phone_number) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ phone_number: userData.user_metadata.phone_number })
        .eq('id', userId);

      if (profileError) {
        console.error(`Error updating profile phone number: ${profileError.message}`);
        // We don't return an error here since the main user update was successful
      }
    }

    // If user_metadata.role exists, update the role in profiles table as well
    if (userData.user_metadata && userData.user_metadata.role) {
      const { error: roleError } = await supabaseAdmin
        .from('profiles')
        .update({ role: userData.user_metadata.role })
        .eq('id', userId);

      if (roleError) {
        console.error(`Error updating profile role: ${roleError.message}`);
        return new Response(
          JSON.stringify({ error: `Failed to update user role in profiles table: ${roleError.message}` }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
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
