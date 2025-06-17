
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      team,
      address,
      zipcode,
      country,
      city,
      employeeType,
      hourlySalary,
      employedPercentage,
      socialSecurityNumber,
      accountNumber,
      paycheckSolution,
      redirectUrl
    } = await req.json()

    console.log('Inviting employee:', email, 'with team:', team)

    // Step 1: Create user in auth.users
    const { data: authData, error: authError } = await supabaseClient.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: redirectUrl || `${Deno.env.get('SUPABASE_URL')?.replace('/supabase', '')}/set-password`,
        data: {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          role: 'employee',
          team: team
        }
      }
    )

    if (authError) {
      console.error('Auth invitation error:', authError)
      throw new Error(`Failed to invite user: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('No user returned from invitation')
    }

    console.log('User invited successfully:', authData.user.id)

    // Step 2: Create profile record
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .upsert({
        id: authData.user.id,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber || null,
        role: 'employee',
        team: team,
        language: 'en'
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Try to clean up the auth user
      await supabaseClient.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Failed to create profile: ${profileError.message}`)
    }

    console.log('Profile created successfully')

    // Step 3: Create employee record
    const { error: employeeError } = await supabaseClient
      .from('employees')
      .insert({
        id: authData.user.id,
        address: address,
        zipcode: zipcode,
        country: country,
        city: city,
        employee_type: employeeType,
        hourly_salary: hourlySalary,
        employed_percentage: employedPercentage,
        social_security_number: socialSecurityNumber,
        account_number: accountNumber,
        paycheck_solution: paycheckSolution || '',
        team: team
      })

    if (employeeError) {
      console.error('Employee creation error:', employeeError)
      // Clean up profile and auth user
      await supabaseClient.from('profiles').delete().eq('id', authData.user.id)
      await supabaseClient.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Failed to create employee record: ${employeeError.message}`)
    }

    console.log('Employee record created successfully')

    return new Response(
      JSON.stringify({
        success: true,
        user: authData.user,
        message: 'Employee invited successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in invite-employee function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
