import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trophy, 
  Target, 
  Users, 
  Briefcase, 
  Calendar, 
  FileText, 
  Settings, 
  Clock, 
  AlertTriangle,
  BarChart3,
  Upload,
  UserCheck,
  Building,
  MessageSquare,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/notifications';
import { useNavigate } from 'react-router-dom';

export const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead,
    isMarkingAsRead,
    isMarkingAllAsRead 
  } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read when clicked
    markAsRead(notification.id);

    // Navigate to relevant page based on entity type
    if (notification.entity_type && notification.entity_id) {
      switch (notification.entity_type) {
        case 'project':
          navigate(`/projects/${notification.entity_id}`);
          break;
        case 'deal':
          navigate(`/deals`);
          break;
        case 'task':
          navigate(`/tasks/${notification.entity_id}`);
          break;
        case 'contract':
          navigate(`/contracts/${notification.entity_id}`);
          break;
        case 'campaign':
          navigate(`/campaigns/${notification.entity_id}`);
          break;
        case 'company':
          navigate(`/companies/${notification.entity_id}`);
          break;
        case 'milestone':
          // Navigate to the project page since milestones are part of projects
          navigate(`/projects`);
          break;
        case 'profile':
          navigate(`/settings`);
          break;
        case 'news':
          navigate(`/dashboard`);
          break;
        case 'ad':
          // Navigate to the ad details page
          navigate(`/ads/${notification.entity_id}`);
          break;
        default:
          break;
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'project_assigned':
      case 'project_completed':
      case 'project_deadline_approaching':
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      case 'deal_assigned':
      case 'deal_stage_changed':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'deal_won':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'task_assigned':
      case 'task_completed':
      case 'task_overdue':
        return <Check className="h-4 w-4 text-purple-500" />;
      case 'contract_signed':
      case 'contract_signature_reminder':
        return <FileText className="h-4 w-4 text-indigo-500" />;
      case 'due_date_approaching':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'campaign_assigned':
      case 'campaign_status_changed':
      case 'campaign_comment_added':
      case 'campaign_approved':
      case 'campaign_rejected':
        return <Users className="h-4 w-4 text-pink-500" />;
      case 'company_advisor_assigned':
        return <UserCheck className="h-4 w-4 text-teal-500" />;
      case 'new_company_contact':
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      case 'new_subsidiary':
        return <Building className="h-4 w-4 text-purple-600" />;
      case 'company_edited':
        return <Settings className="h-4 w-4 text-gray-600" />;
      case 'company_deleted':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'ads_status_change':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'ads_comments_change':
        return <MessageSquare className="h-4 w-4 text-indigo-600" />;
      case 'role_changed':
        return <Settings className="h-4 w-4 text-gray-500" />;
      case 'monthly_time_reminder':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'milestone_created':
        return <Target className="h-4 w-4 text-emerald-500" />;
      case 'weekly_progress_report':
      case 'monthly_progress_report':
        return <BarChart3 className="h-4 w-4 text-cyan-500" />;
      case 'file_uploaded_to_project':
        return <Upload className="h-4 w-4 text-green-600" />;
      case 'meeting_deadline_conflict':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'news_posted':
        return <Bell className="h-4 w-4 text-blue-400" />;
      default:
        return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  const getNotificationPriority = (type: string) => {
    const highPriority = [
      'deal_won', 
      'task_overdue', 
      'contract_signature_reminder', 
      'meeting_deadline_conflict',
      'company_deleted',
      'ads_status_change'
    ];
    const mediumPriority = [
      'project_deadline_approaching', 
      'due_date_approaching', 
      'role_changed',
      'company_edited',
      'new_company_contact',
      'new_subsidiary',
      'ads_comments_change'
    ];
    
    if (highPriority.includes(type)) return 'high';
    if (mediumPriority.includes(type)) return 'medium';
    return 'low';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-gray-600 rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllAsRead}
              className="h-6 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No new notifications</p>
            <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            {notifications.slice(0, 10).map((notification) => {
              const priority = getNotificationPriority(notification.type);
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 bg-blue-50 border-l-2 border-l-blue-500 ${
                    priority === 'high' ? 'bg-red-50' : priority === 'medium' ? 'bg-yellow-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
