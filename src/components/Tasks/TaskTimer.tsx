import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Clock, Play, Pause, Save, DollarSign } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRealtimeTimeEntries } from '@/hooks/realtime/useRealtimeTimeEntries';

interface TaskTimerProps {
  taskId: string;
}

type TimeEntryWithUser = {
  id: string;
  user_id: string;
  task_id: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  created_at: string;
  is_billable: boolean;
  company_id: string | null;
  profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
};

export const TaskTimer: React.FC<TaskTimerProps> = ({ taskId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Enable real-time updates for this task's time entries
  useRealtimeTimeEntries({ taskId, enabled: true });
  
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [activeEntry, setActiveEntry] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [showBillableDialog, setShowBillableDialog] = useState(false);
  const [pendingTimeEntry, setPendingTimeEntry] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };
    getCurrentUser();
  }, []);
  
  // Fetch task details to get company_id and title
  const { data: task } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, company_id')
        .eq('id', taskId)
        .single();
      
      if (error) {
        console.error('Error fetching task:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!taskId,
  });
  
  // Fetch time entries for this task with user profiles
  const { data: timeEntries = [] } = useQuery({
    queryKey: ['time-entries', taskId],
    queryFn: async () => {
      // First fetch time entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('task_id', taskId)
        .order('start_time', { ascending: false });
      
      if (entriesError) {
        toast({
          title: 'Error fetching time entries',
          description: entriesError.message,
          variant: 'destructive',
        });
        return [];
      }

      if (!entriesData || entriesData.length === 0) {
        return [];
      }

      // Get unique user IDs
      const userIds = Array.from(new Set(entriesData.map(entry => entry.user_id)));
      
      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Create a map of profiles by user ID
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      // Combine entries with their profiles
      const entriesWithProfiles: TimeEntryWithUser[] = entriesData.map(entry => ({
        ...entry,
        profiles: profilesMap.get(entry.user_id) || null
      }));
      
      return entriesWithProfiles;
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

      // Get current user ID for the time entry
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Create new time entry with task and company assignment
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          task_id: taskId,
          company_id: task?.company_id || null,
          start_time: new Date().toISOString(),
          user_id: userId,
          description: description || null,
          is_billable: false // Default to false, will be set when stopping
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
      // Note: Real-time updates will handle query invalidation automatically
    },
    onError: (error: any) => {
      toast({
        title: 'Error starting timer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Stop timer mutation (first step - just stop and show dialog)
  const stopTimerMutation = useMutation({
    mutationFn: async () => {
      if (!activeEntry) throw new Error('No active timer to stop');
      
      // Set default description if user hasn't entered anything
      let finalDescription = description;
      if (!description.trim() && task?.title) {
        finalDescription = `Worked with ${task.title}`;
      }
      
      // Update time entry with end time but don't set billable status yet
      const { data, error } = await supabase
        .from('time_entries')
        .update({
          end_time: new Date().toISOString(),
          description: finalDescription || null,
        })
        .eq('id', activeEntry.id)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: (data) => {
      setIsRunning(false);
      setSeconds(0);
      setActiveEntry(null);
      setPendingTimeEntry(data);
      setShowBillableDialog(true);
      // Note: Real-time updates will handle query invalidation automatically
    },
    onError: (error: any) => {
      toast({
        title: 'Error stopping timer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Final save mutation with billable status
  const finalizeTimeEntryMutation = useMutation({
    mutationFn: async (isBillable: boolean) => {
      if (!pendingTimeEntry) throw new Error('No pending time entry');
      
      const { data, error } = await supabase
        .from('time_entries')
        .update({
          is_billable: isBillable,
        })
        .eq('id', pendingTimeEntry.id)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      setShowBillableDialog(false);
      setPendingTimeEntry(null);
      setDescription('');
      // Note: Real-time updates will handle query invalidation automatically
      toast({
        title: 'Timer stopped',
        description: 'Your time has been logged successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error finalizing time entry',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const handleBillableSelection = (isBillable: boolean) => {
    finalizeTimeEntryMutation.mutate(isBillable);
  };
  
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
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Handle time entry click to navigate to time tracking page - only for current user
  const handleTimeEntryClick = (entryId: string, entryUserId: string) => {
    if (currentUserId && entryUserId === currentUserId) {
      navigate(`/time-tracking?entry=${entryId}`);
    }
  };
  
  // Helper function to get user display name
  const getUserDisplayName = (profile: TimeEntryWithUser['profiles']) => {
    if (!profile) return 'Unknown User';
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown User';
  };
  
  // Helper function to get user initials
  const getUserInitials = (profile: TimeEntryWithUser['profiles']) => {
    if (!profile) return 'U';
    const firstName = profile.first_name?.[0] || '';
    const lastName = profile.last_name?.[0] || '';
    return (firstName + lastName).toUpperCase() || 'U';
  };
  
  return (
    <>
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
              placeholder={`What are you working on? (Leave empty for "Worked with ${task?.title || 'this task'}")`}
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
                {timeEntries.slice(0, 5).map((entry) => {
                  const isOwnEntry = currentUserId && entry.user_id === currentUserId;
                  
                  return (
                    <div 
                      key={entry.id} 
                      className={`text-sm border rounded-md p-3 transition-colors ${
                        isOwnEntry 
                          ? 'cursor-pointer hover:bg-muted/30' 
                          : 'cursor-default'
                      }`}
                      onClick={() => handleTimeEntryClick(entry.id, entry.user_id)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {/* User Avatar and Name */}
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage 
                              src={entry.profiles?.avatar_url || undefined} 
                              alt={getUserDisplayName(entry.profiles)}
                            />
                            <AvatarFallback className="text-xs">
                              {getUserInitials(entry.profiles)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-muted-foreground">
                            {getUserDisplayName(entry.profiles)}
                          </span>
                        </div>
                        
                        {/* Duration and Billable Status */}
                        <div className="flex items-center gap-2 ml-auto">
                          {entry.end_time ? (
                            <span className="font-medium">
                              {formatTime(Math.floor(
                                (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / 1000
                              ))}
                            </span>
                          ) : (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Running
                            </Badge>
                          )}
                          <Badge 
                            variant={entry.is_billable ? "default" : "outline"}
                            className={`flex items-center gap-1 ${
                              entry.is_billable 
                                ? 'bg-green-500 hover:bg-green-600 text-white' 
                                : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            <DollarSign className="h-3 w-3" />
                            {entry.is_billable ? 'Billable' : 'Non-billable'}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Description and Timestamp */}
                      <div className="flex justify-between items-center">
                        {entry.description && (
                          <p className="text-muted-foreground truncate flex-1 mr-2">{entry.description}</p>
                        )}
                        <div className="text-muted-foreground text-xs">
                          {formatDate(entry.start_time)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No time entries yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Billable confirmation dialog */}
      <Dialog open={showBillableDialog} onOpenChange={setShowBillableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Time Entry Settings</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">Should this time entry be marked as billable?</p>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleBillableSelection(true)}
                disabled={finalizeTimeEntryMutation.isPending}
                className="flex-1"
              >
                Billable
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleBillableSelection(false)}
                disabled={finalizeTimeEntryMutation.isPending}
                className="flex-1"
              >
                Non-Billable
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskTimer;
