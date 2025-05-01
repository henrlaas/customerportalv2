
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
    console.log(`Update request received for user: ${userId}, but employee editing is disabled`);
    
    // Return an error explaining that editing employees is disabled
    return new Response(
      JSON.stringify({ 
        error: 'Employee editing has been disabled by administrator',
        message: "Employee editing functionality has been disabled"
      }),
      {
        status: 403,
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
