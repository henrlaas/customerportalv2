
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

export const handleInviteUser = async (
  body: any,
  origin: string,
  supabaseAdmin: SupabaseClient,
  corsHeaders: Record<string, string>
) => {
  const { email, displayName, role, team, language } = body;
  
  console.log(`Inviting user: ${email} with role: ${role}`);
  
  const redirectUrl = `${origin}/set-password?type=invite`;
  console.log(`Redirect URL: ${redirectUrl}`);

  if (!email) {
    return new Response(
      JSON.stringify({ error: 'Email is required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  const userRole = role || 'client';
  
  if (!['admin', 'employee', 'client'].includes(userRole)) {
    return new Response(
      JSON.stringify({ error: 'Invalid role' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: redirectUrl,
      data: {
        display_name: displayName || '',
        role: userRole,
        team: team || '',
        language: language || 'en',
      },
    });

    if (error) {
      console.error('Error inviting user:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('User invited successfully:', data);

    return new Response(
      JSON.stringify({ 
        message: `Invitation sent to ${email}`,
        data: data,
        user: data.user
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
    console.error('Exception while inviting user:', errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};
