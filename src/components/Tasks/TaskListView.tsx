
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
  due_date: string | null;
  related_type: string | null;
  client_visible: boolean | null;
  assignees?: { id: string; user_id: string }[];
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
  profiles: Contact[];
  onTaskClick: (taskId: string) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  getStatusBadge,
  getPriorityBadge,
  getTaskAssignees,
  getCampaignName,
  profiles,
  onTaskClick,
}) => {
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
            {tasks.map(task => (
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
                  {task.creator_id && (
                    <UserAvatarGroup 
                      users={[profiles.find(p => p.id === task.creator_id)].filter((p): p is Contact => !!p)}
                      size="sm"
                    />
                  )}
                  {!task.creator_id && 'Unassigned'}
                </TableCell>
                <TableCell>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</TableCell>
                <TableCell>
                  {task.campaign_id ? (
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
