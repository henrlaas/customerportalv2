import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useProjectTimeData } from '@/hooks/useProjectTimeData';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, Clock, CheckSquare, BarChart3 } from 'lucide-react';
import { ProjectTimeEntryDialog } from './ProjectTimeEntryDialog';

type ProjectTimeTrackingTabProps = {
  projectId: string;
  companyId?: string;
};

export const ProjectTimeTrackingTab = ({ projectId, companyId }: ProjectTimeTrackingTabProps) => {
  const { timeEntries, isLoading, timeStats } = useProjectTimeData(projectId);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);

  // Add debugging to track when component renders and data changes
  console.log('ProjectTimeTrackingTab rendered for project:', projectId, 'with', timeEntries?.length || 0, 'entries');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  // Format time in hours and minutes
  const formatHours = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Project Time Tracking</h3>
        <Button onClick={() => setIsEntryDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Time Entry
        </Button>
      </div>

      {/* Enhanced Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Time Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Total Hours</div>
              <div className="text-2xl font-bold text-blue-600">{formatHours(timeStats.totalHours)}</div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                <Clock className="h-3 w-3" />
                Direct Project Time
              </div>
              <div className="text-2xl font-bold text-green-600">{formatHours(timeStats.directHours)}</div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-1 text-sm text-purple-600 font-medium">
                <CheckSquare className="h-3 w-3" />
                Task Time
              </div>
              <div className="text-2xl font-bold text-purple-600">{formatHours(timeStats.taskHours)}</div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 font-medium">Total Entries</div>
              <div className="text-2xl font-bold text-gray-600">{timeStats.totalEntries}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!timeEntries || timeEntries.length === 0 ? (
        <div className="text-center p-8 text-gray-500 rounded-xl bg-muted/50">
          <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p>No time entries found for this project yet.</p>
          <p className="text-sm">Create a new time entry to start tracking time for this project.</p>
        </div>
      ) : (
        <>
          {/* Enhanced Team Members Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Team Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Total Time</TableHead>
                    <TableHead>Direct Time</TableHead>
                    <TableHead>Task Time</TableHead>
                    <TableHead>Entries</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(timeStats.entriesByUser).map((userData) => (
                    <TableRow key={userData.user.id}>
                      <TableCell className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          {userData.user.avatar_url ? (
                            <AvatarImage src={userData.user.avatar_url} alt={userData.user.name} />
                          ) : null}
                          <AvatarFallback>
                            {userData.user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{userData.user.name}</span>
                      </TableCell>
                      <TableCell className="font-medium">{formatHours(userData.hours)}</TableCell>
                      <TableCell>
                        <span className="text-green-600">{formatHours(userData.directHours)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-purple-600">{formatHours(userData.taskHours)}</span>
                      </TableCell>
                      <TableCell>{userData.entries}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Enhanced Recent Time Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Time Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.slice(0, 10).map((entry) => {
                    const startTime = new Date(entry.start_time);
                    const endTime = entry.end_time ? new Date(entry.end_time) : new Date();
                    const durationMs = endTime.getTime() - startTime.getTime();
                    const hours = Math.floor(durationMs / (1000 * 60 * 60));
                    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                    const duration = `${hours}h ${minutes}m`;
                    const userName = entry.employee ? 
                      `${entry.employee.first_name || ''} ${entry.employee.last_name || ''}`.trim() || 'Unknown'
                      : 'Unknown';
                    
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>{format(startTime, 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={entry.entry_source === 'direct' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                            }
                          >
                            {entry.entry_source === 'direct' ? (
                              <><Clock className="h-3 w-3 mr-1" />Direct</>
                            ) : (
                              <><CheckSquare className="h-3 w-3 mr-1" />Task</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{entry.description || 'No description'}</div>
                            {entry.entry_source === 'task' && entry.task_name && (
                              <div className="text-xs text-purple-600 mt-1">
                                Task: {entry.task_name}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            {entry.employee?.avatar_url ? (
                              <AvatarImage src={entry.employee.avatar_url} alt={userName} />
                            ) : null}
                            <AvatarFallback>
                              {userName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{userName}</span>
                        </TableCell>
                        <TableCell>{duration}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Time Entry Creation Dialog */}
      <ProjectTimeEntryDialog
        isOpen={isEntryDialogOpen}
        onClose={() => setIsEntryDialogOpen(false)}
        projectId={projectId}
        companyId={companyId}
      />
    </div>
  );
};
