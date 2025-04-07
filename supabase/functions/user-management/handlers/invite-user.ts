
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

export const handleInviteUser = async (
  body: any,
  origin: string,
  supabaseAdmin: SupabaseClient,
  corsHeaders: Record<string, string>
) => {
  const { email, firstName, lastName, role, team } = body;
  
  console.log(`Inviting user: ${email} with role: ${role}`);
  
  // Update to add the type=invite parameter to the redirect URL
  const redirectUrl = `${origin}/set-password?type=invite`;
  console.log(`Redirect URL: ${redirectUrl}`);

  // Validate inputs
  if (!email || !role) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  // Verify the role is valid
  if (!['admin', 'employee', 'client'].includes(role)) {
    return new Response(
      JSON.stringify({ error: 'Invalid role' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  // Invite the user using the admin API with the updated redirect URL
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: redirectUrl,
    data: {
      first_name: firstName || '',
      last_name: lastName || '',
      role: role,
      team: team || '',
    },
  });

  if (error) throw error;

  console.log('User invited successfully:', data);

  return new Response(
    JSON.stringify({ 
      message: `Invitation sent to ${email}`,
      data: data 
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    }
  );
};
