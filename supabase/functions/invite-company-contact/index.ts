
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
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
    
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

    // Create profile record using upsert to handle potential trigger conflicts
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber || null,
        role: 'client',
        language: 'en',
        avatar_url: null
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error(`Error creating profile: ${profileError.message}`);
      return new Response(
        JSON.stringify({ error: `Failed to create profile: ${profileError.message}` }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log(`Profile created successfully for user: ${userId}`);

    // Create company contact record
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
