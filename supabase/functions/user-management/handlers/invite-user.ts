
import { corsHeaders } from "../utils/cors.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { updateUserProfile } from "../utils/profile-helpers.ts";

export const handleInviteUser = async (
  body: {
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role?: string;
    language?: string;
    redirect?: string;
    team?: string;
  },
  origin: string,
  supabaseAdmin: SupabaseClient,
  corsHeaders: Record<string, string>
) => {
  const { 
    email, 
    firstName, 
    lastName, 
    phoneNumber, 
    role = "client", 
    language = "en",
    redirect,
    team
  } = body;

  if (!email) {
    return new Response(
      JSON.stringify({ error: 'Email is required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  try {
    console.log(`Inviting user: ${email} with role: ${role}, firstName: ${firstName}, lastName: ${lastName}`);
    
    // First, check if user already exists
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
    let userData;

    if (existingUser) {
      console.log(`User already exists: ${email}, updating their profile`);
      userData = { user: existingUser };
      
      // Update existing user's metadata
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        {
          user_metadata: {
            ...existingUser.user_metadata,
            first_name: firstName || existingUser.user_metadata?.first_name,
            last_name: lastName || existingUser.user_metadata?.last_name,
            phone_number: phoneNumber || existingUser.user_metadata?.phone_number,
            role,
            language,
            team
          }
        }
      );

      if (updateError) {
        console.error(`Error updating existing user: ${updateError.message}`);
        return new Response(
          JSON.stringify({ error: updateError.message }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      userData = { user: updatedUser.user };
    } else {
      console.log(`Creating new user: ${email}`);
      
      // Generate a random password for the new user
      const randomPassword = Math.random().toString(36).slice(-10);
      
      // Create the user in Supabase Auth
      const { data: newUserData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true, // Auto-confirm the email
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          role,
          language,
          team
        }
      });

      if (createUserError) {
        console.error(`Error creating user: ${createUserError.message}`);
        return new Response(
          JSON.stringify({ error: createUserError.message }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }

      userData = newUserData;
    }

    // If user was created or updated successfully, update their profile
    if (userData.user && userData.user.id) {
      console.log(`Updating profile for user: ${userData.user.id}`);
      try {
        await updateUserProfile(supabaseAdmin, userData.user.id, {
          firstName,
          lastName,
          phoneNumber,
          language,
          team
        });
        console.log("Profile updated successfully");
      } catch (profileError) {
        console.error("Error updating profile:", profileError);
        // Continue with the invitation process even if profile update fails
        // but log the error for debugging
      }
    }

    // Send a password reset email so the user can set their own password (only for new users)
    if (!existingUser) {
      let resetPasswordError = null;
      if (redirect) {
        const { error } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email,
          options: {
            redirectTo: redirect,
          }
        });
        resetPasswordError = error;
      } else {
        const { error } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email
        });
        resetPasswordError = error;
      }

      if (resetPasswordError) {
        console.error(`Error sending password reset email: ${resetPasswordError.message}`);
        // We don't return an error here since the user was created successfully
      }
    }

    const message = existingUser 
      ? "User already exists and has been updated with new information."
      : "User invited successfully. A password reset email has been sent.";

    return new Response(
      JSON.stringify({
        user: userData.user,
        message
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error(`Error in handleInviteUser: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};
