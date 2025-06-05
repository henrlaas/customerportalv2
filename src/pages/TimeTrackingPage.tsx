
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { TimeEntry, ViewType } from '@/types/timeTracking';
import { TimeTrackerHeader } from '@/components/TimeTracking/TimeTrackerHeader';
import { TimeEntrySearch } from '@/components/TimeTracking/TimeEntrySearch';
import { TimeEntryList } from '@/components/TimeTracking/TimeEntryList';
import { TimeEntryForm } from '@/components/TimeTracking/TimeEntryForm';
import { MonthlyHoursSummary } from '@/components/TimeTracking/MonthlyHoursSummary';
import { CalendarView } from '@/components/TimeTracking/CalendarView';
import { DeleteTimeEntryDialog } from '@/components/TimeTracking/DeleteTimeEntryDialog';

const TimeTrackingPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<ViewType>("list");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch time entries
  const { data: timeEntries = [], isLoading } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });
      
      if (error) {
        toast({
          title: 'Error fetching time entries',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      // Check if there's any active time entry (without end_time)
      const active = data.find(entry => !entry.end_time);
      if (active) {
        setIsTracking(true);
        setActiveEntry(active);
      }
      
      return data as TimeEntry[];
    },
    enabled: !!user,
  });
  
  // Delete time entry mutation
  const deleteTimeEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return entryId;
    },
    onSuccess: (deletedEntryId) => {
      // Invalidate and refetch time entries
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      
      // Show success toast
      toast({
        title: 'Time entry deleted',
        description: 'The time entry was successfully deleted.',
      });
      
      // If the deleted entry was the active one, reset tracking state
      if (activeEntry && activeEntry.id === deletedEntryId) {
        setIsTracking(false);
        setActiveEntry(null);
        setElapsedTime(0);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error deleting time entry',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Only fetch additional data when needed for filtering/display
  // This lazy loading approach improves initial page load performance
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, company_id')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }
      
      return data;
    },
    // Only fetch when we have time entries to display
    enabled: timeEntries.length > 0,
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching companies:', error);
        return [];
      }
      
      return data;
    },
    // Only fetch when we have time entries to display
    enabled: timeEntries.length > 0,
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, company_id')
        .order('name');
      
      if (error) {
        console.error('Error fetching campaigns:', error);
        return [];
      }
      
      return data;
    },
    // Only fetch when we have time entries to display
    enabled: timeEntries.length > 0,
  });
  
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, company_id')
        .order('name');
      
      if (error) {
        console.error('Error fetching projects:', error);
        return [];
      }
      
      return data;
    },
    // Only fetch when we have time entries to display
    enabled: timeEntries.length > 0,
  });
  
  // Edit time entry
  const handleEdit = (entry: TimeEntry) => {
    setCurrentEntry(entry);
    setIsEditing(true);
  };
  
  // Reset current entry and close edit dialog
  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentEntry(null);
  };

  // Handle delete time entry
  const handleDelete = (entry: TimeEntry) => {
    setEntryToDelete(entry);
    setIsDeleteDialogOpen(true);
  };
  
  // Confirm delete time entry
  const confirmDelete = () => {
    if (entryToDelete) {
      deleteTimeEntryMutation.mutate(entryToDelete.id);
    }
    setIsDeleteDialogOpen(false);
    setEntryToDelete(null);
  };
  
  // Cancel delete
  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setEntryToDelete(null);
  };

  // Update elapsed time for active time entry
  useEffect(() => {
    if (!isTracking || !activeEntry) return;
    
    const interval = setInterval(() => {
      const start = new Date(activeEntry.start_time).getTime();
      const now = new Date().getTime();
      setElapsedTime(Math.floor((now - start) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isTracking, activeEntry]);
  
  // Filter entries by search query
  const filteredEntries = timeEntries.filter(entry => 
    entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.task_id && tasks.find(task => task.id === entry.task_id)?.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (entry.company_id && companies.find(company => company.id === entry.company_id)?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (entry.campaign_id && campaigns.find(campaign => campaign.id === entry.campaign_id)?.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (entry.project_id && projects.find(project => project.id === entry.project_id)?.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="container mx-auto p-6">
      <MonthlyHoursSummary />
      
      <TimeTrackerHeader
        isTracking={isTracking}
        elapsedTime={elapsedTime}
        activeEntry={activeEntry}
        setIsTracking={setIsTracking}
        setActiveEntry={setActiveEntry}
        view={view}
        setView={setView}
      />
      
      {view === "list" && (
        <>
          <TimeEntrySearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          
          <TimeEntryList
            timeEntries={filteredEntries}
            isLoading={isLoading}
            tasks={tasks}
            companies={companies}
            campaigns={campaigns}
            projects={projects}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}

      {view === "calendar" && (
        <CalendarView 
          timeEntries={timeEntries}
          onEditEntry={handleEdit}
          onDeleteEntry={handleDelete}
          tasks={tasks}
          companies={companies}
          campaigns={campaigns}
          projects={projects}
          isLoading={isLoading}
        />
      )}
      
      {/* Edit Time Entry Dialog */}
      {isEditing && (
        <TimeEntryForm
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          currentEntry={currentEntry}
          onCancelEdit={handleCancelEdit}
        />
      )}
      
      {/* Delete Time Entry Dialog */}
      <DeleteTimeEntryDialog
        isOpen={isDeleteDialogOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        timeEntry={entryToDelete}
      />
    </div>
  );
};

export default TimeTrackingPage;
