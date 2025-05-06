
import { useState, useEffect } from 'react';
import { Play, Square, Clock, ListIcon, Calendar } from 'lucide-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDuration } from '@/utils/timeUtils';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { TimeEntry, ViewType } from '@/types/timeTracking';
import { TimeEntryForm } from './TimeEntryForm';

type TimeTrackerHeaderProps = {
  isTracking: boolean;
  elapsedTime: number;
  activeEntry: TimeEntry | null;
  setIsTracking: (tracking: boolean) => void;
  setActiveEntry: (entry: TimeEntry | null) => void;
  view: ViewType;
  setView: (view: ViewType) => void;
};

export const TimeTrackerHeader = ({
  isTracking,
  elapsedTime,
  activeEntry,
  setIsTracking,
  setActiveEntry,
  view,
  setView,
}: TimeTrackerHeaderProps) => {
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [completedEntry, setCompletedEntry] = useState<TimeEntry | null>(null);
  
  // Update description from active entry
  useEffect(() => {
    if (activeEntry?.description) {
      setDescription(activeEntry.description);
    } else {
      setDescription('');
    }
  }, [activeEntry]);

  // Start tracking mutation
  const startTracking = useMutation({
    mutationFn: async () => {
      if (!user) return null;
      
      // Create a new time entry
      const { data, error } = await supabase
        .from('time_entries')
        .insert([{ 
          user_id: user.id, 
          start_time: new Date().toISOString(),
          description: description || null
        }])
        .select();
      
      if (error) throw error;
      return data[0] as TimeEntry;
    },
    onSuccess: (data) => {
      if (data) {
        setActiveEntry(data);
        setIsTracking(true);
        toast({
          title: 'Time tracking started',
          description: 'Your time is now being tracked.',
        });
        queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error starting time tracking',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Stop tracking mutation
  const stopTracking = useMutation({
    mutationFn: async () => {
      if (!activeEntry) return null;
      
      // Update the active time entry with an end time
      const { data, error } = await supabase
        .from('time_entries')
        .update({ 
          end_time: new Date().toISOString(),
          description: description || null
        })
        .eq('id', activeEntry.id)
        .select();
      
      if (error) throw error;
      return data[0] as TimeEntry;
    },
    onSuccess: (data) => {
      if (data) {
        setCompletedEntry(data);
        setShowEntryForm(true);
      }
      setActiveEntry(null);
      setIsTracking(false);
      toast({
        title: 'Time tracking stopped',
        description: 'Please provide additional details for your time entry.',
      });
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyHours'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error stopping time tracking',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle click on start/stop button
  const handleToggleTracking = () => {
    if (isTracking) {
      stopTracking.mutate();
    } else {
      if (!description.trim()) {
        toast({
          title: 'Description required',
          description: 'Please enter a description before starting time tracking.',
          variant: 'destructive',
        });
        return;
      }
      startTracking.mutate();
    }
  };

  const handleCompleteEdit = () => {
    setShowEntryForm(false);
    setCompletedEntry(null);
  };

  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-auto">
          <h2 className="text-xl font-bold mb-2">Time Tracker</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="What are you working on?"
              className={`w-full border rounded px-3 py-2 ${isTracking ? '' : 'border-primary'}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isTracking}
              required
            />
            <Button
              onClick={handleToggleTracking}
              variant={isTracking ? "destructive" : "default"}
              className="whitespace-nowrap"
              disabled={!isTracking && !description.trim()}
            >
              {isTracking ? (
                <>
                  <Square className="mr-2 h-4 w-4" /> Stop
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Start
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="flex gap-4 items-center">
            {isTracking && (
              <div className="text-center flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-mono text-lg">
                  {formatDuration(elapsedTime)}
                </span>
              </div>
            )}
            
            <Button variant="outline" onClick={() => setIsCreating(true)}>
              Manual Entry
            </Button>
            
            <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as ViewType)}>
              <ToggleGroupItem value="list" aria-label="List View">
                <ListIcon className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="calendar" aria-label="Calendar View">
                <Calendar className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
      
      {/* Manual entry form */}
      <TimeEntryForm 
        isCreating={isCreating} 
        setIsCreating={setIsCreating}
      />

      {/* Form for completed entry */}
      {completedEntry && (
        <TimeEntryForm
          isEditing={showEntryForm} 
          setIsEditing={setShowEntryForm}
          currentEntry={completedEntry}
          onCancelEdit={handleCompleteEdit}
          onComplete={handleCompleteEdit}
          isCompletingTracking={true}
        />
      )}
    </div>
  );
};
