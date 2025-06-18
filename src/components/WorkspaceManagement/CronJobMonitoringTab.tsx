import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface CronJobLog {
  id: string;
  job_name: string;
  execution_time: string;
  status: 'success' | 'error';
  details: any;
  created_at: string;
}

export const CronJobMonitoringTab: React.FC = () => {
  const [logs, setLogs] = useState<CronJobLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<CronJobLog | null>(null);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cron_job_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      // Type cast the data since we know the database constraint ensures only 'success' | 'error' values
      setLogs((data || []) as CronJobLog[]);
    } catch (error) {
      console.error('Error fetching cron job logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch cron job logs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testFunction = async (functionName: string) => {
    try {
      toast({
        title: 'Testing Function',
        description: `Triggering ${functionName} manually...`,
      });

      const { error } = await supabase.functions.invoke(functionName);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `${functionName} executed successfully`,
      });
      
      // Refresh logs after a short delay
      setTimeout(fetchLogs, 2000);
    } catch (error) {
      console.error(`Error testing ${functionName}:`, error);
      toast({
        title: 'Error',
        description: `Failed to execute ${functionName}`,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const jobStats = logs.reduce((acc, log) => {
    if (!acc[log.job_name]) {
      acc[log.job_name] = { success: 0, error: 0, lastRun: null };
    }
    acc[log.job_name][log.status]++;
    if (!acc[log.job_name].lastRun || new Date(log.created_at) > new Date(acc[log.job_name].lastRun)) {
      acc[log.job_name].lastRun = log.created_at;
    }
    return acc;
  }, {} as Record<string, { success: number; error: number; lastRun: string | null }>);

  // Add static jobs that might not have logs yet
  const knownJobs = ['check-due-dates', 'contract-reminders', 'monthly-reminders'];
  knownJobs.forEach(job => {
    if (!jobStats[job]) {
      jobStats[job] = { success: 0, error: 0, lastRun: null };
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Cron Job Monitoring</h3>
          <p className="text-sm text-muted-foreground">
            Monitor scheduled notification jobs and their execution status
          </p>
        </div>
        <Button onClick={fetchLogs} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Job Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(jobStats).map(([jobName, stats]) => (
          <Card key={jobName}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{jobName}</CardTitle>
              <CardDescription className="text-xs">
                {stats.lastRun ? `Last run: ${formatDistanceToNow(new Date(stats.lastRun), { addSuffix: true })}` : 'Never run'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <span className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                  {stats.success} success
                </span>
                <span className="flex items-center">
                  <XCircle className="h-3 w-3 text-red-500 mr-1" />
                  {stats.error} errors
                </span>
              </div>
              <div className="mt-2 space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => testFunction(jobName)}
                  className="text-xs"
                >
                  Test Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Execution Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
          <CardDescription>
            Last 100 cron job executions with details and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 && !isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              No cron job logs found yet. The jobs will start logging once they run.
            </div>
          ) : (
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Execution Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.job_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(log.status)}
                          {getStatusBadge(log.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(log.execution_time), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.details?.executionTimeMs ? `${log.details.executionTimeMs}ms` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.status === 'success' ? (
                          <span className="text-green-600">
                            {log.details?.notificationsCreated || log.details?.remindersCreated || 0} notifications
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {log.details?.errors?.length || 0} errors
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedLog(log)}
                          className="text-xs"
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedLog.job_name} Execution Details</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedLog(null)}>
                  ×
                </Button>
              </CardTitle>
              <CardDescription>
                Executed {formatDistanceToNow(new Date(selectedLog.execution_time), { addSuffix: true })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <pre className="text-xs bg-gray-50 p-4 rounded-md overflow-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
