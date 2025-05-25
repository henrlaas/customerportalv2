
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { email, firstName, lastName, phoneNumber, position, companyId } = await req.json();

    if (!email || !firstName || !lastName || !companyId) {
      return new Response(
        JSON.stringify({ error: 'Email, first name, last name, and company ID are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log(`Inviting user: ${email} for company: ${companyId}`);

    // First check if user already exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error(`Error listing users: ${listError.message}`);
      return new Response(
        JSON.stringify({ error: listError.message }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const existingUser = existingUsers.users.find(user => user.email === email);
    
    if (existingUser) {
      console.log(`User already exists: ${email}`);
      return new Response(
        JSON.stringify({ error: 'User already exists' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Invite the user
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        role: 'client',
        language: 'en'
      }
    });
    
    if (inviteError) {
      console.error(`Error inviting user: ${inviteError.message}`);
      return new Response(
        JSON.stringify({ error: inviteError.message }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (!inviteData.user?.id) {
      return new Response(
        JSON.stringify({ error: 'No user ID returned from invitation' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const userId = inviteData.user.id;
    console.log(`User invited successfully, user ID: ${userId}`);

    // Wait a moment for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update the profile with additional details (the trigger creates a basic profile)
    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber || null,
      })
      .eq('id', userId);

    if (profileUpdateError) {
      console.error(`Error updating profile: ${profileUpdateError.message}`);
      // Don't fail here, just log the error as the profile creation might still work
      console.log(`Profile update failed, but continuing with company contact creation`);
    } else {
      console.log(`Profile updated successfully for user: ${userId}`);
    }

    // Create company contact record - insert only, no updates
    const { error: contactError } = await supabaseAdmin
      .from('company_contacts')
      .insert({
        company_id: companyId,
        user_id: userId,
        position: position || null,
        is_primary: false,
        is_admin: false
      });

    if (contactError) {
      console.error(`Error creating company contact: ${contactError.message}`);
      return new Response(
        JSON.stringify({ error: `Failed to create company contact: ${contactError.message}` }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log(`Company contact created successfully for user: ${userId}`);

    return new Response(
      JSON.stringify({
        user: inviteData.user,
        message: 'User invited successfully. They will receive an email invitation to set their password.'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error(`Error in invite-company-contact function: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
