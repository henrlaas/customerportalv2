
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  creator_id: string | null;
  campaign_id: string | null;
  project_id: string | null;
  due_date: string | null;
  related_type: string | null;
  client_visible: boolean | null;
  assignees?: { id: string; user_id: string }[];
  creator?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | { error: boolean } | null;
}

interface Contact {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
}

interface TaskListViewProps {
  tasks: Task[];
  getStatusBadge: (status: string) => React.ReactNode;
  getPriorityBadge: (priority: string) => React.ReactNode;
  getTaskAssignees: (task: Task) => Contact[];
  getCampaignName: (campaignId: string | null) => string;
  getProjectName: (projectId: string | null) => string;
  profiles: Contact[];
  onTaskClick: (taskId: string) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  getStatusBadge,
  getPriorityBadge,
  getTaskAssignees,
  getCampaignName,
  getProjectName,
  profiles,
  onTaskClick,
}) => {
  // Helper function to check if creator is valid
  const isValidCreator = (creator: any): creator is { id: string; first_name: string | null; last_name: string | null; avatar_url: string | null } => {
    return creator && typeof creator === 'object' && 'id' in creator && !('error' in creator);
  };

  return (
    <div className="bg-white rounded-md border shadow-sm overflow-hidden w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignees</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Related To</TableHead>
              <TableHead>Client Visible</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks && tasks.length > 0 ? (
              tasks.map(task => (
                <TableRow 
                  key={task.id}
                  className="cursor-pointer hover:bg-muted/60"
                  onClick={() => onTaskClick(task.id)}
                >
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>
                    <UserAvatarGroup 
                      users={getTaskAssignees(task)}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell>
                    {isValidCreator(task.creator) ? (
                      <UserAvatarGroup 
                        users={[{
                          id: task.creator.id,
                          first_name: task.creator.first_name,
                          last_name: task.creator.last_name,
                          avatar_url: task.creator.avatar_url
                        }]}
                        size="sm"
                      />
                    ) : (
                      'Unassigned'
                    )}
                  </TableCell>
                  <TableCell>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</TableCell>
                  <TableCell>
                    {task.project_id ? (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                        Project: {getProjectName(task.project_id)}
                      </Badge>
                    ) : task.campaign_id ? (
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                        Campaign: {getCampaignName(task.campaign_id)}
                      </Badge>
                    ) : task.related_type ? (
                      <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                        {task.related_type}
                      </Badge>
                    ) : 'None'}
                  </TableCell>
                  <TableCell>
                    {task.client_visible ? (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Visible</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">Hidden</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No tasks found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
