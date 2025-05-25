
import { corsHeaders } from '../utils/cors.ts';
import { createAdminClient } from '../utils/supabase.ts';

export const handleGetUserEmails = async (req: Request) => {
  try {
    // Check if the request is a POST request
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    // Parse the request body only once
    const body = await req.json();
    const { userIds } = body;

    // Validate request body
    if (!userIds || !Array.isArray(userIds)) {
      return new Response(
        JSON.stringify({ error: 'userIds array is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create admin client
    const supabase = createAdminClient();

    // Use the built-in function to get user emails
    const { data, error } = await supabase.rpc('get_users_email', {
      user_ids: userIds,
    });

    if (error) throw error;

    // Return the emails in the expected format
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in handleGetUserEmails:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};
