
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced logging function
const logExecution = async (supabaseClient: any, status: string, details: any) => {
  try {
    await supabaseClient.rpc('log_cron_execution', {
      p_job_name: 'monthly-reminders',
      p_status: status,
      p_details: details
    });
  } catch (error) {
    console.error('Failed to log execution:', error);
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now();
  const executionDetails: any = {
    timestamp: new Date().toISOString(),
    usersChecked: 0,
    remindersCreated: 0,
    isLastDayOfMonth: false,
    errors: []
  };

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
    
    executionDetails.isLastDayOfMonth = isLastDayOfMonth;
    
    console.log(`Starting monthly reminders check at: ${now.toISOString()}`);
    console.log(`Is last day of month: ${isLastDayOfMonth}`);

    if (isLastDayOfMonth) {
      // Get all users with employee or admin roles with better query
      const { data: users, error: usersError } = await supabaseClient
        .from('profiles')
        .select('id, first_name, last_name, role')
        .in('role', ['admin', 'employee'])

      if (usersError) {
        console.error('Error fetching users:', usersError)
        executionDetails.errors.push({ type: 'users_fetch', error: usersError.message });
      } else if (users) {
        executionDetails.usersChecked = users.length;
        console.log(`Found ${users.length} users to check for time entries`);

        // Process users in batches for better performance
        const batchSize = 10;
        for (let i = 0; i < users.length; i += batchSize) {
          const batch = users.slice(i, i + batchSize);
          
          // Process batch in parallel
          await Promise.all(batch.map(async (user) => {
            try {
              const monthStart = new Date(currentYear, currentMonth, 1)
              const monthEnd = new Date(currentYear, currentMonth + 1, 0)
              
              // Check if user has any time entries this month
              const { data: timeEntries, error: timeEntriesError } = await supabaseClient
                .from('time_entries')
                .select('id, start_time, end_time')
                .eq('user_id', user.id)
                .gte('start_time', monthStart.toISOString())
                .lte('start_time', monthEnd.toISOString())

              if (!timeEntriesError) {
                const entryCount = timeEntries?.length || 0
                const monthName = monthStart.toLocaleString('default', { month: 'long', year: 'numeric' })
                
                // Calculate total hours for more detailed message
                let totalHours = 0;
                if (timeEntries && timeEntries.length > 0) {
                  totalHours = timeEntries.reduce((sum, entry) => {
                    if (entry.end_time) {
                      const hours = (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / (1000 * 60 * 60);
                      return sum + hours;
                    }
                    return sum;
                  }, 0);
                }

                // Enhanced deduplication - check for reminders in the last 3 days
                const { data: existingNotification } = await supabaseClient
                  .from('notifications')
                  .select('id')
                  .eq('user_id', user.id)
                  .eq('type', 'monthly_time_reminder')
                  .gte('created_at', new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString())

                if (!existingNotification || existingNotification.length === 0) {
                  let message;
                  if (entryCount === 0) {
                    message = `No time entries recorded for ${monthName}. Please review and add your time entries before month-end.`
                  } else {
                    const hoursText = totalHours > 0 ? ` (${Math.round(totalHours * 10) / 10} hours)` : '';
                    message = `You have ${entryCount} time entries for ${monthName}${hoursText}. Please review them for accuracy before month-end.`
                  }

                  await supabaseClient.rpc('create_notification', {
                    p_user_id: user.id,
                    p_type: 'monthly_time_reminder',
                    p_title: 'Monthly Time Entry Reminder',
                    p_message: message,
                    p_entity_type: 'time_entry',
                    p_entity_id: null
                  });
                  
                  executionDetails.remindersCreated++;
                  console.log(`Created monthly reminder for user ${user.id} (${entryCount} entries, ${Math.round(totalHours * 10) / 10} hours)`);
                } else {
                  console.log(`Skipped reminder for user ${user.id} - already notified recently`);
                }
              } else {
                console.error(`Error fetching time entries for user ${user.id}:`, timeEntriesError);
                executionDetails.errors.push({ 
                  type: 'time_entries_fetch', 
                  userId: user.id, 
                  error: timeEntriesError.message 
                });
              }
            } catch (error) {
              console.error(`Error processing user ${user.id}:`, error);
              executionDetails.errors.push({ 
                type: 'user_processing', 
                userId: user.id, 
                error: error.message 
              });
            }
          }));
        }
      }
    } else {
      console.log('Not the last day of the month, skipping time entry reminders');
    }

    const executionTime = Date.now() - startTime;
    executionDetails.executionTimeMs = executionTime;
    
    console.log(`Monthly reminders check completed in ${executionTime}ms`);
    console.log('Execution summary:', executionDetails);

    // Log successful execution
    await logExecution(supabaseClient, 'success', executionDetails);

    return new Response(
      JSON.stringify({ 
        success: true,
        ...executionDetails
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    const executionTime = Date.now() - startTime;
    executionDetails.executionTimeMs = executionTime;
    executionDetails.errors.push({ type: 'general', error: error.message });
    
    console.error('Error in monthly-reminders function:', error);
    
    // Log failed execution
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      await logExecution(supabaseClient, 'error', executionDetails);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: executionDetails 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
