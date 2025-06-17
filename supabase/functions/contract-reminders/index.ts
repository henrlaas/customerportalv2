
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
    const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))

    // Get unsigned contracts older than 1 week
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
    } else if (oldContracts) {
      for (const contract of oldContracts) {
        if (contract.created_by) {
          const weeksOld = Math.floor((now.getTime() - new Date(contract.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000))
          const companyName = contract.companies?.name || 'Unknown Company'
          const contractTitle = contract.title || 'Untitled Contract'
          
          const message = `Contract "${contractTitle}" for ${companyName} has been unsigned for ${weeksOld} week${weeksOld > 1 ? 's' : ''}. Consider following up.`

          // Check if reminder already sent this week
          const { data: existingNotification } = await supabaseClient
            .from('notifications')
            .select('id')
            .eq('user_id', contract.created_by)
            .eq('entity_type', 'contract')
            .eq('entity_id', contract.id)
            .eq('type', 'contract_signature_reminder')
            .gte('created_at', new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)).toISOString())

          if (!existingNotification || existingNotification.length === 0) {
            await supabaseClient.rpc('create_notification', {
              p_user_id: contract.created_by,
              p_type: 'contract_signature_reminder',
              p_title: 'Contract Signature Reminder',
              p_message: message,
              p_entity_type: 'contract',
              p_entity_id: contract.id
            })
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        contractsChecked: oldContracts?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in contract-reminders function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
