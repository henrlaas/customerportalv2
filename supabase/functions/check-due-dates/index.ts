
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
      p_job_name: 'check-due-dates',
      p_status: status,
      p_details: details
    });
  } catch (error) {
    console.error('Failed to log execution:', error);
  }
};

// Batch processing function for better performance
const processBatch = async (items: any[], batchSize: number, processor: (batch: any[]) => Promise<void>) => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await processor(batch);
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now();
  const executionDetails: any = {
    timestamp: new Date().toISOString(),
    tasksChecked: 0,
    overdueTasksChecked: 0,
    projectsChecked: 0,
    conflictsChecked: 0,
    notificationsCreated: 0,
    errors: []
  };

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000))
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000))

    console.log('Starting due date check at:', now.toISOString());

    // Check for tasks due within 3 days with optimized query
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
      .neq('status', 'completed')

    if (tasksError) {
      console.error('Error fetching due tasks:', tasksError)
      executionDetails.errors.push({ type: 'due_tasks_fetch', error: tasksError.message });
    } else if (dueTasks) {
      executionDetails.tasksChecked = dueTasks.length;
      console.log(`Found ${dueTasks.length} tasks due within 3 days`);

      // Process in batches of 10 to avoid overwhelming the system
      await processBatch(dueTasks, 10, async (taskBatch) => {
        for (const task of taskBatch) {
          try {
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
              const daysUntilDue = Math.ceil((new Date(task.due_date).getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
              const message = daysUntilDue === 0 
                ? `Task "${task.title}" is due today!`
                : `Task "${task.title}" is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}!`

              // Enhanced deduplication check
              const { data: existingNotification } = await supabaseClient
                .from('notifications')
                .select('id')
                .eq('user_id', userId)
                .eq('entity_type', 'task')
                .eq('entity_id', task.id)
                .eq('type', 'due_date_approaching')
                .gte('created_at', new Date(now.getTime() - (12 * 60 * 60 * 1000)).toISOString()) // Within last 12 hours

              if (!existingNotification || existingNotification.length === 0) {
                await supabaseClient.rpc('create_notification', {
                  p_user_id: userId,
                  p_type: 'due_date_approaching',
                  p_title: 'Task Due Soon',
                  p_message: message,
                  p_entity_type: 'task',
                  p_entity_id: task.id
                })
                executionDetails.notificationsCreated++;
              }
            }
          } catch (error) {
            console.error(`Error processing task ${task.id}:`, error);
            executionDetails.errors.push({ type: 'task_processing', taskId: task.id, error: error.message });
          }
        }
      });
    }

    // Check for overdue tasks with similar optimizations
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
      executionDetails.errors.push({ type: 'overdue_tasks_fetch', error: overdueTasksError.message });
    } else if (overdueTasks) {
      executionDetails.overdueTasksChecked = overdueTasks.length;
      console.log(`Found ${overdueTasks.length} overdue tasks`);

      await processBatch(overdueTasks, 10, async (taskBatch) => {
        for (const task of taskBatch) {
          try {
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
              const daysOverdue = Math.ceil((now.getTime() - new Date(task.due_date).getTime()) / (24 * 60 * 60 * 1000))
              const message = `Task "${task.title}" is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue!`

              // Check for existing overdue notification today
              const { data: existingNotification } = await supabaseClient
                .from('notifications')
                .select('id')
                .eq('user_id', userId)
                .eq('entity_type', 'task')
                .eq('entity_id', task.id)
                .eq('type', 'task_overdue')
                .gte('created_at', new Date(now.getTime() - (18 * 60 * 60 * 1000)).toISOString()) // Within last 18 hours

              if (!existingNotification || existingNotification.length === 0) {
                await supabaseClient.rpc('create_notification', {
                  p_user_id: userId,
                  p_type: 'task_overdue',
                  p_title: 'Task Overdue',
                  p_message: message,
                  p_entity_type: 'task',
                  p_entity_id: task.id
                })
                executionDetails.notificationsCreated++;
              }
            }
          } catch (error) {
            console.error(`Error processing overdue task ${task.id}:`, error);
            executionDetails.errors.push({ type: 'overdue_task_processing', taskId: task.id, error: error.message });
          }
        }
      });
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
      executionDetails.errors.push({ type: 'projects_fetch', error: projectsError.message });
    } else if (dueProjects) {
      executionDetails.projectsChecked = dueProjects.length;
      console.log(`Found ${dueProjects.length} projects due within 7 days`);

      for (const project of dueProjects) {
        try {
          if (project.project_assignees) {
            for (const assignee of project.project_assignees) {
              const daysUntilDue = Math.ceil((new Date(project.deadline).getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
              const message = daysUntilDue === 0 
                ? `Project "${project.name}" deadline is today!`
                : `Project "${project.name}" deadline is in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}!`

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
                executionDetails.notificationsCreated++;
              }
            }
          }
        } catch (error) {
          console.error(`Error processing project ${project.id}:`, error);
          executionDetails.errors.push({ type: 'project_processing', projectId: project.id, error: error.message });
        }
      }
    }

    // Simplified deadline conflict detection
    const { data: upcomingDeadlines } = await supabaseClient
      .from('tasks')
      .select('id, title, due_date, assigned_to, task_assignees(user_id)')
      .not('due_date', 'is', null)
      .gte('due_date', now.toISOString())
      .lte('due_date', sevenDaysFromNow.toISOString())
      .neq('status', 'completed')

    if (upcomingDeadlines) {
      executionDetails.conflictsChecked = upcomingDeadlines.length;
      
      // Group deadlines by user and date for conflict detection
      const deadlinesByUserAndDate: Record<string, Record<string, any[]>> = {}
      
      for (const task of upcomingDeadlines) {
        const assigneeIds = new Set<string>()
        
        if (task.assigned_to) assigneeIds.add(task.assigned_to)
        if (task.task_assignees) {
          task.task_assignees.forEach((assignee: any) => assigneeIds.add(assignee.user_id))
        }

        for (const userId of assigneeIds) {
          const dateKey = new Date(task.due_date).toDateString()
          
          if (!deadlinesByUserAndDate[userId]) deadlinesByUserAndDate[userId] = {}
          if (!deadlinesByUserAndDate[userId][dateKey]) deadlinesByUserAndDate[userId][dateKey] = []
          
          deadlinesByUserAndDate[userId][dateKey].push(task)
        }
      }

      // Check for conflicts (more than 2 tasks due on the same day)
      for (const userId of Object.keys(deadlinesByUserAndDate)) {
        for (const dateKey of Object.keys(deadlinesByUserAndDate[userId])) {
          const tasksOnDate = deadlinesByUserAndDate[userId][dateKey]
          
          if (tasksOnDate.length > 2) {
            try {
              const { data: existingNotification } = await supabaseClient
                .from('notifications')
                .select('id')
                .eq('user_id', userId)
                .eq('type', 'meeting_deadline_conflict')
                .like('message', `%${dateKey}%`)
                .gte('created_at', new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString())

              if (!existingNotification || existingNotification.length === 0) {
                const taskTitles = tasksOnDate.map(t => t.title).slice(0, 3).join(', ')
                const additionalCount = tasksOnDate.length > 3 ? ` and ${tasksOnDate.length - 3} more` : ''
                const message = `You have ${tasksOnDate.length} tasks due on ${dateKey}: ${taskTitles}${additionalCount}`

                await supabaseClient.rpc('create_notification', {
                  p_user_id: userId,
                  p_type: 'meeting_deadline_conflict',
                  p_title: 'Deadline Conflict Detected',
                  p_message: message,
                  p_entity_type: 'task',
                  p_entity_id: null
                })
                executionDetails.notificationsCreated++;
              }
            } catch (error) {
              console.error(`Error processing conflict for user ${userId}:`, error);
              executionDetails.errors.push({ type: 'conflict_processing', userId, error: error.message });
            }
          }
        }
      }
    }

    const executionTime = Date.now() - startTime;
    executionDetails.executionTimeMs = executionTime;
    
    console.log(`Due date check completed in ${executionTime}ms`);
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
    
    console.error('Error in check-due-dates function:', error);
    
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
