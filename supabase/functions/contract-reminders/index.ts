
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
      p_job_name: 'contract-reminders',
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
    contractsChecked: 0,
    remindersCreated: 0,
    errors: []
  };

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))

    console.log('Starting contract reminders check at:', now.toISOString());

    // Get unsigned contracts older than 1 week with optimized query
    const { data: oldContracts, error: contractsError } = await supabaseClient
      .from('contracts')
      .select(`
        id,
        title,
        created_by,
        created_at,
        company_id,
        companies(name)
      `)
      .eq('status', 'unsigned')
      .lt('created_at', oneWeekAgo.toISOString())

    if (contractsError) {
      console.error('Error fetching old contracts:', contractsError)
      executionDetails.errors.push({ type: 'contracts_fetch', error: contractsError.message });
    } else if (oldContracts) {
      executionDetails.contractsChecked = oldContracts.length;
      console.log(`Found ${oldContracts.length} unsigned contracts older than 1 week`);

      // Process contracts in batches for better performance
      const batchSize = 5;
      for (let i = 0; i < oldContracts.length; i += batchSize) {
        const batch = oldContracts.slice(i, i + batchSize);
        
        // Process batch in parallel
        await Promise.all(batch.map(async (contract) => {
          try {
            if (contract.created_by) {
              const weeksOld = Math.floor((now.getTime() - new Date(contract.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000))
              const companyName = contract.companies?.name || 'Unknown Company'
              const contractTitle = contract.title || 'Untitled Contract'
              
              const message = `Contract "${contractTitle}" for ${companyName} has been unsigned for ${weeksOld} week${weeksOld > 1 ? 's' : ''}. Consider following up.`

              // Enhanced deduplication - check for reminders in the last 5 days to avoid weekly spam
              const { data: existingNotification } = await supabaseClient
                .from('notifications')
                .select('id')
                .eq('user_id', contract.created_by)
                .eq('entity_type', 'contract')
                .eq('entity_id', contract.id)
                .eq('type', 'contract_signature_reminder')
                .gte('created_at', new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)).toISOString()) // Within last 5 days

              if (!existingNotification || existingNotification.length === 0) {
                await supabaseClient.rpc('create_notification', {
                  p_user_id: contract.created_by,
                  p_type: 'contract_signature_reminder',
                  p_title: 'Contract Signature Reminder',
                  p_message: message,
                  p_entity_type: 'contract',
                  p_entity_id: contract.id
                });
                
                executionDetails.remindersCreated++;
                console.log(`Created reminder for contract ${contract.id} (${weeksOld} weeks old)`);
              } else {
                console.log(`Skipped reminder for contract ${contract.id} - already notified recently`);
              }
            }
          } catch (error) {
            console.error(`Error processing contract ${contract.id}:`, error);
            executionDetails.errors.push({ 
              type: 'contract_processing', 
              contractId: contract.id, 
              error: error.message 
            });
          }
        }));
      }
    }

    const executionTime = Date.now() - startTime;
    executionDetails.executionTimeMs = executionTime;
    
    console.log(`Contract reminders check completed in ${executionTime}ms`);
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
    
    console.error('Error in contract-reminders function:', error);
    
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
