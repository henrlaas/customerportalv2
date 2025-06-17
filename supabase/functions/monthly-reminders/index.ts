
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Get the last day of current month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    const isLastDayOfMonth = now.getDate() === lastDayOfMonth.getDate()

    if (isLastDayOfMonth) {
      // Get all users with employee or admin roles
      const { data: users, error: usersError } = await supabaseClient
        .from('profiles')
        .select('id, first_name, last_name')
        .in('role', ['admin', 'employee'])

      if (usersError) {
        console.error('Error fetching users:', usersError)
      } else if (users) {
        for (const user of users) {
          // Check if user has any time entries this month
          const monthStart = new Date(currentYear, currentMonth, 1)
          const monthEnd = new Date(currentYear, currentMonth + 1, 0)
          
          const { data: timeEntries, error: timeEntriesError } = await supabaseClient
            .from('time_entries')
            .select('id')
            .eq('user_id', user.id)
            .gte('start_time', monthStart.toISOString())
            .lte('start_time', monthEnd.toISOString())

          if (!timeEntriesError) {
            const entryCount = timeEntries?.length || 0
            const monthName = monthStart.toLocaleString('default', { month: 'long', year: 'numeric' })
            
            // Check if reminder already sent today
            const { data: existingNotification } = await supabaseClient
              .from('notifications')
              .select('id')
              .eq('user_id', user.id)
              .eq('type', 'monthly_time_reminder')
              .gte('created_at', new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString())

            if (!existingNotification || existingNotification.length === 0) {
              const message = entryCount === 0 
                ? `No time entries recorded for ${monthName}. Please review and add your time entries before month-end.`
                : `You have ${entryCount} time entries for ${monthName}. Please review them for accuracy before month-end.`

              await supabaseClient.rpc('create_notification', {
                p_user_id: user.id,
                p_type: 'monthly_time_reminder',
                p_title: 'Monthly Time Entry Reminder',
                p_message: message,
                p_entity_type: 'time_entry',
                p_entity_id: null
              })
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        isLastDayOfMonth,
        usersNotified: isLastDayOfMonth ? users?.length || 0 : 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in monthly-reminders function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
