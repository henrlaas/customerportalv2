
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
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000))

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

    // Check for overdue tasks
    const { data: overdueTasks, error: overdueTasksError } = await supabaseClient
      .from('tasks')
      .select(`
        id,
        title,
        due_date,
        assigned_to,
        task_assignees(user_id)
      `)
      .not('due_date', 'is', null)
      .lt('due_date', now.toISOString())
      .neq('status', 'completed')

    if (overdueTasksError) {
      console.error('Error fetching overdue tasks:', overdueTasksError)
    } else if (overdueTasks) {
      for (const task of overdueTasks) {
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
          const daysOverdue = Math.ceil((now.getTime() - new Date(task.due_date).getTime()) / (24 * 60 * 60 * 1000))
          const message = `Task "${task.title}" is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue!`

          // Check if notification already exists for this task and user (daily overdue notifications)
          const { data: existingNotification } = await supabaseClient
            .from('notifications')
            .select('id')
            .eq('user_id', userId)
            .eq('entity_type', 'task')
            .eq('entity_id', task.id)
            .eq('type', 'task_overdue')
            .gte('created_at', new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString()) // Within last 24 hours

          if (!existingNotification || existingNotification.length === 0) {
            await supabaseClient.rpc('create_notification', {
              p_user_id: userId,
              p_type: 'task_overdue',
              p_title: 'Task Overdue',
              p_message: message,
              p_entity_type: 'task',
              p_entity_id: task.id
            })
          }
        }
      }
    }

    // Check for projects due within 7 days
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
      .lte('deadline', sevenDaysFromNow.toISOString())

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
              .eq('type', 'project_deadline_approaching')
              .gte('created_at', new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString())

            if (!existingNotification || existingNotification.length === 0) {
              await supabaseClient.rpc('create_notification', {
                p_user_id: assignee.user_id,
                p_type: 'project_deadline_approaching',
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

    // Check for deadline conflicts (multiple deadlines on the same day)
    const { data: upcomingDeadlines, error: deadlinesError } = await supabaseClient
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
      .lte('due_date', sevenDaysFromNow.toISOString())
      .neq('status', 'completed')

    if (!deadlinesError && upcomingDeadlines) {
      // Group deadlines by user and date
      const deadlinesByUserAndDate: Record<string, Record<string, any[]>> = {}
      
      for (const task of upcomingDeadlines) {
        const assigneeIds = new Set<string>()
        
        if (task.assigned_to) {
          assigneeIds.add(task.assigned_to)
        }
        
        if (task.task_assignees) {
          task.task_assignees.forEach((assignee: any) => {
            assigneeIds.add(assignee.user_id)
          })
        }

        for (const userId of assigneeIds) {
          const dateKey = new Date(task.due_date).toDateString()
          
          if (!deadlinesByUserAndDate[userId]) {
            deadlinesByUserAndDate[userId] = {}
          }
          
          if (!deadlinesByUserAndDate[userId][dateKey]) {
            deadlinesByUserAndDate[userId][dateKey] = []
          }
          
          deadlinesByUserAndDate[userId][dateKey].push(task)
        }
      }

      // Check for conflicts (more than 2 tasks due on the same day)
      for (const userId of Object.keys(deadlinesByUserAndDate)) {
        for (const dateKey of Object.keys(deadlinesByUserAndDate[userId])) {
          const tasksOnDate = deadlinesByUserAndDate[userId][dateKey]
          
          if (tasksOnDate.length > 2) {
            const taskTitles = tasksOnDate.map(t => t.title).join(', ')
            const message = `You have ${tasksOnDate.length} tasks due on ${dateKey}: ${taskTitles}`

            // Check if conflict notification already exists
            const { data: existingNotification } = await supabaseClient
              .from('notifications')
              .select('id')
              .eq('user_id', userId)
              .eq('type', 'meeting_deadline_conflict')
              .like('message', `%${dateKey}%`)
              .gte('created_at', new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString())

            if (!existingNotification || existingNotification.length === 0) {
              await supabaseClient.rpc('create_notification', {
                p_user_id: userId,
                p_type: 'meeting_deadline_conflict',
                p_title: 'Deadline Conflict Detected',
                p_message: message,
                p_entity_type: 'task',
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
        tasksChecked: dueTasks?.length || 0,
        overdueTasksChecked: overdueTasks?.length || 0,
        projectsChecked: dueProjects?.length || 0,
        conflictsChecked: Object.keys(upcomingDeadlines || {}).length
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
