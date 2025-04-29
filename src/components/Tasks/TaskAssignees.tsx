
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserRound } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Contact = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
};

interface TaskAssigneesProps {
  assignees: Contact[];
  maxDisplay?: number;
}

export const TaskAssignees: React.FC<TaskAssigneesProps> = ({ 
  assignees, 
  maxDisplay = 3 
}) => {
  if (!assignees || assignees.length === 0) {
    return (
      <div className="flex items-center">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
            <UserRound size={14} />
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  // Helper function to get initials from name
  const getInitials = (firstName: string | null, lastName: string | null) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  // Helper function to get full name
  const getFullName = (profile: Contact) => {
    return `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User';
  };

  // Display assignees up to the max, then show a +X more indicator
  const displayAssignees = assignees.slice(0, maxDisplay);
  const remainingCount = assignees.length - displayAssignees.length;

  return (
    <div className="flex -space-x-2">
      <TooltipProvider>
        {displayAssignees.map((assignee) => (
          <Tooltip key={assignee.id}>
            <TooltipTrigger asChild>
              <Avatar className="h-6 w-6 border-2 border-white">
                {assignee.avatar_url ? (
                  <AvatarImage src={assignee.avatar_url} alt={getFullName(assignee)} />
                ) : (
                  <AvatarFallback className="bg-purple-100 text-purple-800 text-xs">
                    {getInitials(assignee.first_name, assignee.last_name)}
                  </AvatarFallback>
                )}
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getFullName(assignee)}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-6 w-6 border-2 border-white">
                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                  +{remainingCount}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>+{remainingCount} more assignees</p>
            </TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  );
};

export default TaskAssignees;
