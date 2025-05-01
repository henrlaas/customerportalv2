
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Define CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase admin client for server operations
const createAdminClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

// Helper function to update user profile
const updateUserProfile = async (supabaseAdmin, userId, profileData) => {
  const { error } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId,
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      phone_number: profileData.phoneNumber,
      language: profileData.language || 'en',
      team: profileData.team || 'Employees',
    });
    
  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
  
  return { success: true };
};

interface EmployeeCreateData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  zipcode: string;
  country: string;
  city: string;
  employeeType: "Employee" | "Freelancer";
  hourlySalary: number;
  employedPercentage: number;
  socialSecurityNumber: string;
  accountNumber: string;
  paycheckSolution?: string;
}

async function handleCreateEmployee(body: EmployeeCreateData, origin: string, supabaseAdmin: any) {
  console.log("Creating employee with data:", JSON.stringify(body, null, 2));
  
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
    hourlySalary,
    employedPercentage,
    socialSecurityNumber,
    accountNumber,
    paycheckSolution = ""
  } = body;

  try {
    // Step 1: Check if user with this email already exists
    const { data: existingUser, error: userCheckError } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: email
      }
    });

    if (userCheckError) {
      console.error("Error checking for existing user:", userCheckError);
      throw userCheckError;
    }

    let userId;
    let isNewUser = true;

    // If user exists, get their ID
    if (existingUser && existingUser.users && existingUser.users.length > 0) {
      userId = existingUser.users[0].id;
      isNewUser = false;
      console.log("User already exists with ID:", userId);
      
      // Check if employee record already exists
      const { data: existingEmployee } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (existingEmployee) {
        return {
          id: userId,
          email,
          message: "Employee already exists. No changes made.",
          isExisting: true
        };
      }
    } else {
      // Create new user if they don't exist
      const redirect = `${origin}/set-password`;
      console.log("Attempting to invite user with email:", email);
      
      const { data: userData, error: inviteError } = await supabaseAdmin.functions.invoke('user-management', {
        body: {
          action: 'invite',
          email,
          firstName,
          lastName,
          phoneNumber: phone,
          role: 'employee',
          language: 'en',
          redirect,
          team: 'Employees',
        },
      });

      if (inviteError) {
        console.error("Error creating user:", inviteError);
        throw inviteError;
      }

      if (!userData || !userData.userId) {
        throw new Error("Failed to create user account. No user ID returned.");
      }

      userId = userData.userId;
      console.log("Created user with ID:", userId);
    }

    // Step 2: Insert employee record with the user's ID
    const employeeRecord = {
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
    };
    
    console.log("Attempting to insert employee record:", JSON.stringify(employeeRecord, null, 2));
    
    const { error: employeeError } = await supabaseAdmin
      .from('employees')
      .insert([employeeRecord]);

    if (employeeError) {
      console.error("Error creating employee record:", employeeError);
      
      // If employee creation fails and we created a new user, clean up
      if (isNewUser) {
        try {
          console.log("Attempting to clean up auth user after employee creation error");
          await supabaseAdmin.functions.invoke('user-management', {
            body: {
              action: 'delete',
              userId
            }
          });
        } catch (cleanupError) {
          console.error("Failed to clean up auth user after employee creation error:", cleanupError);
        }
      }
      
      throw employeeError;
    }

    // Update the user profile with additional information
    try {
      console.log("Updating user profile with additional information");
      await updateUserProfile(supabaseAdmin, userId, {
        firstName,
        lastName,
        phoneNumber: phone,
        language: 'en',
        team: 'Employees'
      });
    } catch (profileError) {
      console.error("Error updating profile:", profileError);
      // Continue despite profile update error
    }

    return {
      id: userId,
      email,
      firstName,
      lastName,
      message: isNewUser ? "Employee created successfully and invitation email sent." : "Employee record created for existing user."
    };
  } catch (error) {
    console.error("Error in createEmployee:", error);
    throw error;
  }
}

async function handleDeleteEmployee(body: { employeeId: string }, supabaseAdmin: any) {
  const { employeeId } = body;
  
  if (!employeeId) {
    throw new Error("Employee ID is required");
  }

  try {
    // Delete user from auth - will cascade to profiles and employees tables
    const { error } = await supabaseAdmin.functions.invoke('user-management', {
      body: {
        action: 'delete',
        userId: employeeId
      }
    });

    if (error) {
      throw error;
    }

    return { message: "Employee deleted successfully" };
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw error;
  }
}

async function handleResetPassword(body: { email: string }, origin: string, supabaseAdmin: any) {
  const { email } = body;
  
  if (!email) {
    throw new Error("Email is required");
  }

  try {
    // Call the reset-password handler in user-management
    const { error } = await supabaseAdmin.functions.invoke('user-management', {
      body: {
        action: 'resetPassword',
        email,
      }
    });

    if (error) {
      throw error;
    }

    return { message: "Password reset email sent successfully" };
  } catch (error) {
    console.error("Error sending password reset:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;
    const supabaseAdmin = createAdminClient();
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    console.log(`Processing employee action: ${action}`);
    
    switch(action) {
      case 'create':
        const createResult = await handleCreateEmployee(body, origin, supabaseAdmin);
        return new Response(JSON.stringify(createResult), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        });
      case 'delete':
        const deleteResult = await handleDeleteEmployee(body, supabaseAdmin);
        return new Response(JSON.stringify(deleteResult), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        });
      case 'resetPassword':
        const resetResult = await handleResetPassword(body, origin, supabaseAdmin);
        return new Response(JSON.stringify(resetResult), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        });
      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        });
    }
  } catch (error) {
    console.error("Employee management edge function error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unknown error occurred",
        details: error instanceof Error ? error.stack : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
