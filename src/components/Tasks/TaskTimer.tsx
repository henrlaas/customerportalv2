import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, formatDistance, formatDistanceStrict } from 'date-fns';
import { calculateDuration } from '@/utils/timeUtils';
import { Play, Pause, Clock, Trash2, Plus, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TimeEntryForm } from '../TimeTracking/TimeEntryForm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type ProfileData = {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

type TimeEntry = {
  id: string;
  user_id: string;
  task_id: string;
  start_time: string;
  end_time: string | null;
  description: string | null;
  is_running: boolean | null;
  created_at: string;
  profiles?: ProfileData | null;
};

type TaskTimerProps = {
  taskId: string;
};

export const TaskTimer = ({ taskId }: TaskTimerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTimeEntry, setActiveTimeEntry] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const [isAddTimeDialogOpen, setIsAddTimeDialogOpen] = useState(false);
  const [totalTrackedTime, setTotalTrackedTime] = useState<string>('00:00:00');

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      setCurrentUserId(data.session?.user.id || null);
    };
    getCurrentUser();
  }, []);

  // Fetch time entries
  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['taskTimeEntries', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
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
      
      // Type assertion to handle the profiles relation
      return (data as unknown) as TimeEntry[];
    },
    enabled: !!taskId
  });

  // Calculate total time tracked
  useEffect(() => {
    if (timeEntries.length > 0) {
      let totalSeconds = 0;
      
      timeEntries.forEach(entry => {
        if (entry.start_time && entry.end_time) {
          const start = new Date(entry.start_time);
          const end = new Date(entry.end_time);
          const diffInSeconds = (end.getTime() - start.getTime()) / 1000;
          totalSeconds += diffInSeconds;
        }
      });
      
      // Format total time
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      
      setTotalTrackedTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }
  }, [timeEntries]);

  // Check for active time entry
  useEffect(() => {
    const activeEntry = timeEntries.find(entry => entry.is_running && !entry.end_time);
    setActiveTimeEntry(activeEntry || null);
  }, [timeEntries]);

  // Update elapsed time for active timer
  useEffect(() => {
    if (activeTimeEntry && activeTimeEntry.start_time) {
      const interval = setInterval(() => {
        const startTime = new Date(activeTimeEntry.start_time);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        
        // Format time
        const hours = Math.floor(diffInSeconds / 3600);
        const minutes = Math.floor((diffInSeconds % 3600) / 60);
        const seconds = Math.floor(diffInSeconds % 60);
        
        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      setElapsedTime('00:00:00');
    }
  }, [activeTimeEntry]);

  // Start timer mutation
  const startTimer = useMutation({
    mutationFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          task_id: taskId,
          user_id: userId,
          start_time: new Date().toISOString(),
          is_running: true
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskTimeEntries', taskId] });
      toast({
        title: 'Timer started'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error starting timer',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Stop timer mutation
  const stopTimer = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: new Date().toISOString(),
          is_running: false
        })
        .eq('id', entryId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskTimeEntries', taskId] });
      toast({
        title: 'Timer stopped'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error stopping timer',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete time entry mutation
  const deleteTimeEntry = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskTimeEntries', taskId] });
      toast({
        title: 'Time entry deleted'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting time entry',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Format date
  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  // Get initials for avatar
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">Time Tracking</h3>
        <Dialog open={isAddTimeDialogOpen} onOpenChange={setIsAddTimeDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add time
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Time Entry</DialogTitle>
            </DialogHeader>
            <TimeEntryForm
              initialTaskId={taskId}
              onComplete={() => {
                setIsAddTimeDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ['taskTimeEntries', taskId] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Time tracker */}
      <div className="p-4 border rounded-md bg-muted/30">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
            <span className="text-lg font-mono font-semibold">
              {activeTimeEntry ? elapsedTime : '00:00:00'}
            </span>
          </div>
          
          {!activeTimeEntry ? (
            <Button 
              onClick={() => startTimer.mutate()}
              disabled={startTimer.isPending || !currentUserId}
            >
              <Play className="h-4 w-4 mr-1" />
              Start timer
            </Button>
          ) : (
            <Button 
              variant="destructive"
              onClick={() => stopTimer.mutate(activeTimeEntry.id)}
              disabled={stopTimer.isPending || activeTimeEntry.user_id !== currentUserId}
            >
              <Pause className="h-4 w-4 mr-1" />
              Stop timer
            </Button>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Total tracked: {totalTrackedTime}
        </div>
      </div>
      
      {/* Time entries list */}
      <div>
        <h4 className="text-sm font-medium mb-2">Time Entries</h4>
        <ScrollArea className="h-[250px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : timeEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No time entries yet</TableCell>
                </TableRow>
              ) : (
                timeEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={entry.profiles?.avatar_url || undefined} />
                          <AvatarFallback>{getInitials(entry.profiles?.first_name, entry.profiles?.last_name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {entry.profiles?.first_name || ''} {entry.profiles?.last_name || 'User'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDateTime(entry.start_time)}</TableCell>
                    <TableCell>
                      {entry.end_time ? formatDateTime(entry.end_time) : 'Running'}
                    </TableCell>
                    <TableCell>
                      {entry.end_time ? calculateDuration(entry.start_time, entry.end_time) : 'In progress'}
                    </TableCell>
                    <TableCell>
                      {entry.user_id === currentUserId && !entry.is_running && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTimeEntry.mutate(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
};
