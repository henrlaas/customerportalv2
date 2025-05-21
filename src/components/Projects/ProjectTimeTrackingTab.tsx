
import React from 'react';
import { useProjectTimeData } from '@/hooks/useProjectTimeData';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, User } from 'lucide-react';
import { CenteredSpinner } from '@/components/ui/CenteredSpinner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ProjectTimeTrackingTabProps {
  projectId: string | null;
}

export const ProjectTimeTrackingTab: React.FC<ProjectTimeTrackingTabProps> = ({ projectId }) => {
  const { timeEntries, isLoading, error, timeStats } = useProjectTimeData(projectId || undefined);

  if (isLoading) {
    return <CenteredSpinner />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-red-500 mb-4">Error loading time entries. Please try again.</p>
      </div>
    );
  }

  if (!timeEntries || timeEntries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="mb-4 flex flex-col items-center">
          <Clock className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-500 mb-4">No time entries tracked for this project yet.</p>
          <p className="text-sm text-gray-400">Time entries can be created from the Time Tracking page.</p>
        </div>
      </div>
    );
  }

  // Format hours for display
  const formatHours = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Total Time</span>
              <div className="flex items-center mt-1">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                <span className="text-2xl font-bold">{formatHours(timeStats.totalHours)}</span>
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {timeStats.totalEntries} {timeStats.totalEntries === 1 ? 'entry' : 'entries'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-lg font-medium mt-6">Time by Team Member</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(timeStats.entriesByUser).map((userData) => (
          <Card key={userData.user.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={userData.user.avatar_url || undefined} alt={userData.user.name} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{userData.user.name}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatHours(userData.hours)} • {userData.entries} {userData.entries === 1 ? 'entry' : 'entries'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h3 className="text-lg font-medium mt-6">Recent Time Entries</h3>
      <div className="space-y-3">
        {timeEntries.slice(0, 5).map(entry => (
          <Card key={entry.id}>
            <CardContent className="p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{entry.description || 'No description'}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(entry.start_time).toLocaleDateString()} • 
                    {' '}{new Date(entry.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - 
                    {' '}{entry.end_time ? new Date(entry.end_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'In progress'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={entry.employee?.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">
                      {entry.employee ? 
                        `${entry.employee.first_name || ''} ${entry.employee.last_name || ''}`.trim() || 'Unknown' 
                        : 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {entry.end_time && (
                    <p className="font-medium">
                      {formatHours((new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / (1000 * 60 * 60))}
                    </p>
                  )}
                  {entry.is_billable && (
                    <span className="text-xs text-green-600">Billable</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
