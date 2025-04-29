
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
    sendEmail?: boolean;
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
    team,
    sendEmail = true
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
    console.log(`Checking if user exists: ${email}`);
    console.log(`Invite data:`, JSON.stringify({
      firstName, 
      lastName, 
      phoneNumber, 
      role,
      language,
      team,
      redirect,
      sendEmail
    }));
    
    // Check if the user already exists
    const { data: existingUsers, error: searchError } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: email
      }
    });
    
    if (searchError) {
      console.error(`Error searching for user: ${searchError.message}`);
      throw searchError;
    }
    
    let userData;
    let isNewUser = false;
    
    // Handle existing user case
    if (existingUsers && existingUsers.users.length > 0) {
      const existingUser = existingUsers.users[0];
      console.log(`User already exists with ID: ${existingUser.id}`);
      
      // Update user metadata
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        {
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            role,
            language,
            team
          }
        }
      );
      
      if (updateError) {
        console.error(`Error updating user: ${updateError.message}`);
        throw updateError;
      }
      
      userData = { user: updatedUser };
      
      // Update the profile
      await updateUserProfile(supabaseAdmin, existingUser.id, {
        firstName,
        lastName,
        phoneNumber,
        language,
        team
      });
      
      // If sendEmail is true, handle the password reset for existing user
      if (sendEmail) {
        console.log("Sending password reset email to existing user...");
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
          // Continue despite error as the user profile was updated
        } else {
          console.log("Password reset email sent successfully");
        }
      }
    }
    // Create new user case
    else {
      isNewUser = true;
      console.log(`Creating new user: ${email} with role: ${role}, firstName: ${firstName}, lastName: ${lastName}, phoneNumber: ${phoneNumber}, team: ${team}, sendEmail: ${sendEmail}`);
      
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

      // If user was created successfully, update their profile
      if (newUserData.user && newUserData.user.id) {
        console.log(`Updating profile for user: ${newUserData.user.id}`);
        try {
          const profileResult = await updateUserProfile(supabaseAdmin, newUserData.user.id, {
            firstName,
            lastName,
            phoneNumber,
            language,
            team
          });
          console.log("Profile created/updated successfully:", profileResult);
        } catch (profileError) {
          console.error("Error updating profile:", profileError);
          // Continue with the invitation process even if profile update fails
        }
      }

      // Send a password reset email so the user can set their own password
      if (sendEmail) {
        console.log("Sending invitation email...");
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
          console.error(`Error sending invitation email: ${resetPasswordError.message}`);
          // We don't return an error here since the user was created successfully
        } else {
          console.log("Invitation email sent successfully");
        }
      } else {
        console.log("Skipping invitation email as requested");
      }
    }

    console.log("Invitation process completed successfully");
    return new Response(
      JSON.stringify({
        user: userData.user,
        isNewUser: isNewUser,
        message: sendEmail ? 
          isNewUser ? 
            "User invited successfully. An invitation email has been sent." : 
            "Existing user updated. A password reset email has been sent." 
          : isNewUser ?
            "User created successfully. No invitation email was sent." :
            "User updated successfully. No email was sent."
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
