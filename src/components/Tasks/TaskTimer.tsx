
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Play, Pause, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TaskTimerProps {
  taskId: string;
}

type TimeEntry = {
  id: string;
  user_id: string;
  task_id: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  created_at: string;
};

export const TaskTimer: React.FC<TaskTimerProps> = ({ taskId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [activeEntry, setActiveEntry] = useState<any>(null);
  const [description, setDescription] = useState('');
  
  // Fetch time entries for this task
  const { data: timeEntries = [] } = useQuery({
    queryKey: ['time-entries', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('task_id', taskId)
        .order('start_time', { ascending: false });
      
      if (error) {
        toast({
          title: 'Error fetching time entries',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as TimeEntry[];
    },
  });
  
  // Check for active (running) time entries
  useEffect(() => {
    const checkForActiveTimer = async () => {
      const { data: activeData, error } = await supabase
        .from('time_entries')
        .select('*')
        .is('end_time', null)
        .eq('task_id', taskId)
        .maybeSingle();
        
      if (error) {
        console.error('Error checking for active timer:', error);
        return;
      }
      
      if (activeData) {
        setIsRunning(true);
        setActiveEntry(activeData);
        
        // Calculate elapsed time
        const startTime = new Date(activeData.start_time).getTime();
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        setSeconds(elapsedSeconds);
      }
    };
    
    checkForActiveTimer();
  }, [taskId]);
  
  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning]);
  
  // Start timer mutation
  const startTimerMutation = useMutation({
    mutationFn: async () => {
      // Check if there's another active timer first
      const { data: existingTimer, error: checkError } = await supabase
        .from('time_entries')
        .select('id')
        .is('end_time', null)
        .limit(1)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingTimer) {
        throw new Error('You already have an active timer');
      }
      
      // Create new time entry
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          task_id: taskId,
          start_time: new Date().toISOString(),
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: (data) => {
      setIsRunning(true);
      setSeconds(0);
      setActiveEntry(data);
      queryClient.invalidateQueries({ queryKey: ['time-entries', taskId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error starting timer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Stop timer mutation
  const stopTimerMutation = useMutation({
    mutationFn: async () => {
      if (!activeEntry) throw new Error('No active timer to stop');
      
      // Update time entry with end time and description
      const { data, error } = await supabase
        .from('time_entries')
        .update({
          end_time: new Date().toISOString(),
          description: description || null,
        })
        .eq('id', activeEntry.id)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      setIsRunning(false);
      setSeconds(0);
      setDescription('');
      setActiveEntry(null);
      queryClient.invalidateQueries({ queryKey: ['time-entries', taskId] });
      toast({
        title: 'Timer stopped',
        description: 'Your time has been logged successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error stopping timer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Calculate total time spent
  const calculateTotalTimeSpent = () => {
    if (!timeEntries.length) return 0;
    
    let totalSeconds = 0;
    
    timeEntries.forEach(entry => {
      if (!entry.end_time) return;
      
      const startTime = new Date(entry.start_time).getTime();
      const endTime = new Date(entry.end_time).getTime();
      const entrySeconds = Math.floor((endTime - startTime) / 1000);
      
      totalSeconds += entrySeconds;
    });
    
    return totalSeconds;
  };
  
  // Format a date to a readable string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  return (
    <div className="space-y-4">
      {/* Timer display */}
      <div className="flex justify-center items-center border rounded-md p-4 bg-muted/30">
        <div className="text-center">
          <div className="text-3xl font-mono font-bold mb-2">
            {formatTime(seconds)}
          </div>
          
          <div className="flex justify-center gap-2">
            {isRunning ? (
              <Button
                onClick={() => stopTimerMutation.mutate()}
                disabled={stopTimerMutation.isPending}
                className="bg-red-500 hover:bg-red-600"
              >
                <Pause className="mr-2 h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button
                onClick={() => startTimerMutation.mutate()}
                disabled={startTimerMutation.isPending}
              >
                <Play className="mr-2 h-4 w-4" />
                Start Timer
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Description field (only when timer is running) */}
      {isRunning && (
        <div>
          <Textarea
            placeholder="What are you working on? (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none"
            rows={2}
          />
        </div>
      )}
      
      <Separator className="my-4" />
      
      {/* Time entries summary */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Time Entries</h3>
          <Link to="/time-tracking">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>
        
        <div className="py-2">
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline" className="bg-muted">
              <Clock className="h-3 w-3 mr-1" />
              Total: {formatTime(calculateTotalTimeSpent())}
            </Badge>
          </div>
          
          {timeEntries.length > 0 ? (
            <div className="space-y-2">
              {timeEntries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="text-sm border rounded-md p-2">
                  <div className="flex justify-between items-center">
                    <div>
                      {entry.end_time ? (
                        <span>
                          {formatTime(Math.floor(
                            (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / 1000
                          ))}
                        </span>
                      ) : (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Running
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {formatDate(entry.start_time)}
                    </div>
                  </div>
                  {entry.description && (
                    <p className="mt-1 text-muted-foreground truncate">{entry.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No time entries yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskTimer;
