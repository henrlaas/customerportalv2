
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
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000))

    // Check for tasks due within 3 days
    const { data: dueTasks, error: tasksError } = await supabaseClient
      .from('tasks')
      .select(`
        id,
        title,
        due_date,
        assigned_to,
        task_assignees(user_id)
      `)
      .not('due_date', 'is', null)
      .gte('due_date', now.toISOString())
      .lte('due_date', threeDaysFromNow.toISOString())

    if (tasksError) {
      console.error('Error fetching due tasks:', tasksError)
    } else if (dueTasks) {
      for (const task of dueTasks) {
        const assigneeIds = new Set<string>()
        
        // Add direct assignee
        if (task.assigned_to) {
          assigneeIds.add(task.assigned_to)
        }
        
        // Add task assignees
        if (task.task_assignees) {
          task.task_assignees.forEach((assignee: any) => {
            assigneeIds.add(assignee.user_id)
          })
        }

        // Create notifications for all assignees
        for (const userId of assigneeIds) {
          const daysUntilDue = Math.ceil((new Date(task.due_date).getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
          const message = daysUntilDue === 0 
            ? `Task "${task.title}" is due today!`
            : `Task "${task.title}" is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}!`

          // Check if notification already exists for this task and user
          const { data: existingNotification } = await supabaseClient
            .from('notifications')
            .select('id')
            .eq('user_id', userId)
            .eq('entity_type', 'task')
            .eq('entity_id', task.id)
            .eq('type', 'due_date_approaching')
            .gte('created_at', new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString()) // Within last 24 hours

          if (!existingNotification || existingNotification.length === 0) {
            await supabaseClient.rpc('create_notification', {
              p_user_id: userId,
              p_type: 'due_date_approaching',
              p_title: 'Task Due Soon',
              p_message: message,
              p_entity_type: 'task',
              p_entity_id: task.id
            })
          }
        }
      }
    }

    // Check for projects due within 3 days
    const { data: dueProjects, error: projectsError } = await supabaseClient
      .from('projects')
      .select(`
        id,
        name,
        deadline,
        project_assignees(user_id)
      `)
      .not('deadline', 'is', null)
      .gte('deadline', now.toISOString())
      .lte('deadline', threeDaysFromNow.toISOString())

    if (projectsError) {
      console.error('Error fetching due projects:', projectsError)
    } else if (dueProjects) {
      for (const project of dueProjects) {
        if (project.project_assignees) {
          for (const assignee of project.project_assignees) {
            const daysUntilDue = Math.ceil((new Date(project.deadline).getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
            const message = daysUntilDue === 0 
              ? `Project "${project.name}" deadline is today!`
              : `Project "${project.name}" deadline is in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}!`

            // Check if notification already exists
            const { data: existingNotification } = await supabaseClient
              .from('notifications')
              .select('id')
              .eq('user_id', assignee.user_id)
              .eq('entity_type', 'project')
              .eq('entity_id', project.id)
              .eq('type', 'due_date_approaching')
              .gte('created_at', new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString())

            if (!existingNotification || existingNotification.length === 0) {
              await supabaseClient.rpc('create_notification', {
                p_user_id: assignee.user_id,
                p_type: 'due_date_approaching',
                p_title: 'Project Deadline Approaching',
                p_message: message,
                p_entity_type: 'project',
                p_entity_id: project.id
              })
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        tasksChecked: dueTasks?.length || 0,
        projectsChecked: dueProjects?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in check-due-dates function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
