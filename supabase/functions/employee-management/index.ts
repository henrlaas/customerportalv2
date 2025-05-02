
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

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
    const { action, ...data } = await req.json();
    console.log(`Processing employee action: ${action}`);
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    switch (action) {
      case 'create':
        return await handleCreateEmployee(data, supabaseAdmin);
      case 'delete':
        return await handleDeleteEmployee(data, supabaseAdmin);
      case 'resetPassword':
        return await handleResetPassword(data, supabaseAdmin);
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (error) {
    console.error(`Error processing employee request: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

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
    paycheckSolution
  } = data;
  
  console.log(`Creating employee for: ${email}`);
  
  try {
    // Step 1: Check if the user already exists in auth system
    const { data: existingUsers, error: searchError } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: email
      }
    });
    
    if (searchError) {
      throw searchError;
    }
    
    let userId;
    let isExisting = false;
    
    if (existingUsers && existingUsers.users.length > 0) {
      // User exists in the auth system
      const existingUser = existingUsers.users[0];
      userId = existingUser.id;
      console.log(`User already exists with ID: ${userId}`);
      
      // Update user metadata
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          role: 'employee'
        },
        email: email
      });
      
      // Check if this user already exists as an employee
      const { data: existingEmployee } = await supabaseAdmin
        .from('employees')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      // Only mark as existing if they actually have an employee record
      isExisting = !!existingEmployee;
      
      if (isExisting) {
        console.log(`User ${userId} is already registered as an employee`);
      } else {
        console.log(`User ${userId} exists but is not yet registered as an employee`);
      }
    } else {
      // Create new user with random password
      const randomPassword = Math.random().toString(36).slice(-10);
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          role: 'employee'
        }
      });
      
      if (createError) {
        throw createError;
      }
      
      userId = newUser.user.id;
      console.log(`Created new user with ID: ${userId}`);
      
      // Send password reset email to set their own password
      const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email
      });
      
      if (resetError) {
        console.error(`Error sending password reset: ${resetError.message}`);
        // Continue despite error as the user was created
      }
    }
    
    // Step 2: Create/update profile
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
      });
      
    if (profileError) {
      console.error(`Error upserting profile: ${profileError.message}`);
      throw profileError;
    }
    
    // Step 3: Create employee record if it doesn't exist yet
    if (!isExisting) {
      const { error: employeeError } = await supabaseAdmin
        .from('employees')
        .insert({
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
          paycheck_solution: paycheckSolution || ''
        });
        
      if (employeeError) {
        console.error(`Error creating employee record: ${employeeError.message}`);
        throw employeeError;
      }
      
      console.log(`Created new employee record for user ${userId}`);
    }
    
    return new Response(
      JSON.stringify({ 
        id: userId, 
        email,
        isExisting
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error(`Error creating employee: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function handleDeleteEmployee(data, supabaseAdmin) {
  const { employeeId } = data;
  
  if (!employeeId) {
    return new Response(
      JSON.stringify({ error: 'Employee ID is required' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
  
  console.log(`Deleting employee with ID: ${employeeId}`);
  
  try {
    // First delete from employees table
    const { error: deleteEmployeeError } = await supabaseAdmin
      .from('employees')
      .delete()
      .eq('id', employeeId);
    
    if (deleteEmployeeError) {
      console.error(`Error deleting employee record: ${deleteEmployeeError.message}`);
      throw deleteEmployeeError;
    }
    
    // Then delete the user
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(employeeId);
    
    if (deleteUserError) {
      console.error(`Error deleting user: ${deleteUserError.message}`);
      throw deleteUserError;
    }
    
    return new Response(
      JSON.stringify({ message: 'Employee deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(`Error in deleteEmployee: ${error}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function handleResetPassword(data, supabaseAdmin) {
  const { email } = data;
  
  if (!email) {
    return new Response(
      JSON.stringify({ error: 'Email is required' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
  
  console.log(`Sending password reset email to: ${email}`);
  
  try {
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });
    
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify({ message: 'Password reset email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}
