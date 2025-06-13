
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckSquare, 
  Folder, 
  FileText,
  ExternalLink
} from 'lucide-react';
import { CompanyActivity } from '@/hooks/useCompanyActivities';
import { formatDistanceToNow } from 'date-fns';

interface CompanyActivityItemProps {
  activity: CompanyActivity;
}

export const CompanyActivityItem: React.FC<CompanyActivityItemProps> = ({ activity }) => {
  const navigate = useNavigate();

  const getActivityIcon = () => {
    switch (activity.type) {
      case 'task':
        return <CheckSquare className="h-5 w-5 text-blue-600" />;
      case 'project':
        return <Folder className="h-5 w-5 text-green-600" />;
      case 'contract':
        return <FileText className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = () => {
    if (!activity.status) return null;

    const statusConfig = {
      // Task statuses
      todo: { variant: 'outline' as const, label: 'To Do', className: 'border-yellow-300 text-yellow-700' },
      in_progress: { variant: 'outline' as const, label: 'In Progress', className: 'border-blue-300 text-blue-700' },
      completed: { variant: 'outline' as const, label: 'Completed', className: 'border-green-300 text-green-700' },
      cancelled: { variant: 'outline' as const, label: 'Cancelled', className: 'border-red-300 text-red-700' },
      
      // Project status (we set as active)
      active: { variant: 'outline' as const, label: 'Active', className: 'border-green-300 text-green-700' },
      
      // Contract statuses
      unsigned: { variant: 'outline' as const, label: 'Unsigned', className: 'border-orange-300 text-orange-700' },
      signed: { variant: 'outline' as const, label: 'Signed', className: 'border-green-300 text-green-700' },
      expired: { variant: 'outline' as const, label: 'Expired', className: 'border-red-300 text-red-700' },
    };

    const config = statusConfig[activity.status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <Badge 
        variant={config.variant} 
        className={`text-xs ${config.className}`}
      >
        {config.label}
      </Badge>
    );
  };

  const handleClick = () => {
    switch (activity.type) {
      case 'task':
        navigate(`/tasks/${activity.id}`);
        break;
      case 'project':
        navigate(`/projects/${activity.id}`);
        break;
      case 'contract':
        navigate(`/contracts/${activity.id}`);
        break;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recently';
    }
  };

  const getActivityTypeLabel = () => {
    switch (activity.type) {
      case 'task':
        return 'Task';
      case 'project':
        return 'Project';
      case 'contract':
        return 'Contract';
      default:
        return 'Activity';
    }
  };

  return (
    <Button
      variant="ghost"
      className="w-full h-auto p-3 justify-start hover:bg-gray-50 transition-colors"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 w-full">
        {/* Activity Icon */}
        <div className="flex-shrink-0">
          <div className="p-2 rounded-lg bg-gray-100">
            {getActivityIcon()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              {getActivityTypeLabel()}
            </span>
            {getStatusBadge()}
          </div>
          <p className="text-sm font-medium text-gray-900 truncate">
            {activity.title}
          </p>
          <p className="text-xs text-gray-500">
            {formatTimeAgo(activity.created_at)}
          </p>
        </div>

        {/* External link icon */}
        <div className="flex-shrink-0">
          <ExternalLink className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </Button>
  );
};
