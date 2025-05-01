
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key (has admin privileges)
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

    // Parse request body
    const body = await req.json();
    const { action } = body;

    console.log(`Processing employee action: ${action}`);

    switch (action) {
      case 'create':
        return await handleCreateEmployee(body, supabaseAdmin);
      case 'delete':
        return await handleDeleteEmployee(body, supabaseAdmin);
      case 'resetPassword':
        return await handleResetPassword(body, supabaseAdmin);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
    }
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});

/**
 * Creates a new employee by:
 * 1. Creating a user in auth.users
 * 2. Adding user metadata and profile data
 * 3. Creating an entry in the employees table
 */
async function handleCreateEmployee(data, supabaseAdmin) {
  const {
    email,
    firstName,
    lastName,
    phone,
    address,
    zipcode,
    country,
    city,
    employeeType,
    team,
    hourlySalary,
    employedPercentage,
    socialSecurityNumber,
    accountNumber,
    paycheckSolution,
  } = data;

  console.log(`Creating employee for: ${email}`);

  try {
    // First check if the user already exists
    const { data: existingUsers, error: searchError } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: email
      }
    });
    
    if (searchError) {
      console.error(`Error searching for user: ${searchError.message}`);
      throw searchError;
    }
    
    let userId;
    let isExisting = false;
    
    // Handle existing user case
    if (existingUsers && existingUsers.users.length > 0) {
      userId = existingUsers.users[0].id;
      isExisting = true;
      console.log(`User already exists with ID: ${userId}`);
      
      // Update user metadata
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            phone_number: phone,
            role: 'employee',
            team: team
          }
        }
      );
      
      if (updateError) {
        console.error(`Error updating user: ${updateError.message}`);
        throw updateError;
      }
    } else {
      // Create a new user with a random password
      const randomPassword = Math.random().toString(36).slice(-10);
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true, // Skip email confirmation
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          phone_number: phone,
          role: 'employee',
          team: team
        }
      });

      if (createError) {
        console.error(`Error creating user: ${createError.message}`);
        throw createError;
      }

      userId = newUser.user.id;
      console.log(`Created new user with ID: ${userId}`);

      // Send a password reset email so the employee can set their own password
      const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
      });

      if (resetError) {
        console.error(`Error sending password reset: ${resetError.message}`);
        // Continue despite error as the user was created successfully
      }
    }

    // Update profile in profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        role: 'employee',
        team: team,
        language: 'en'
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error(`Error updating profile: ${profileError.message}`);
      // Continue despite error to try creating the employee record
    }

    // Create or update employee record
    const { error: employeeError } = await supabaseAdmin
      .from('employees')
      .upsert({
        id: userId,
        address,
        zipcode,
        country,
        city,
        employee_type: employeeType,
        hourly_salary: hourlySalary,
        employed_percentage: employedPercentage,
        social_security_number: socialSecurityNumber,
        account_number: accountNumber,
        paycheck_solution: paycheckSolution
      }, {
        onConflict: 'id'
      });

    if (employeeError) {
      console.error(`Error creating employee record: ${employeeError.message}`);
      throw employeeError;
    }

    return new Response(
      JSON.stringify({ 
        id: userId,
        email,
        isExisting
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Error in createEmployee:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}

/**
 * Deletes an employee by removing entries from:
 * 1. employees table
 * 2. auth.users table (which will cascade delete from profiles)
 */
async function handleDeleteEmployee(data, supabaseAdmin) {
  const { employeeId } = data;

  if (!employeeId) {
    return new Response(
      JSON.stringify({ error: 'Employee ID is required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  try {
    console.log(`Deleting employee with ID: ${employeeId}`);

    // First delete from employees table
    const { error: deleteEmployeeError } = await supabaseAdmin
      .from('employees')
      .delete()
      .eq('id', employeeId);

    if (deleteEmployeeError) {
      console.error(`Error deleting from employees table: ${deleteEmployeeError.message}`);
      throw deleteEmployeeError;
    }

    // Then delete the user from auth.users
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(
      employeeId
    );

    if (deleteUserError) {
      console.error(`Error deleting user: ${deleteUserError.message}`);
      throw deleteUserError;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Employee deleted successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Error in deleteEmployee:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}

/**
 * Sends a password reset email to an employee
 */
async function handleResetPassword(data, supabaseAdmin) {
  const { email } = data;

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
    console.log(`Sending password reset email to: ${email}`);

    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
    });

    if (error) {
      console.error(`Error sending password reset: ${error.message}`);
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Password reset email sent successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}
