
import React from 'react';
import { Calendar, Repeat, CircleDollarSign, Globe, Megaphone, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Deal, Profile } from '../types/deal';
import { getAssigneeName, formatDate } from '../utils/formatters';

interface DealInfoSectionProps {
  deal: Deal;
  profiles: Profile[];
}

export const DealInfoSection = ({ deal, profiles }: DealInfoSectionProps) => {
  const assignedUser = profiles.find(profile => profile.id === deal.assigned_to);
  
  const getUserInitials = (user: Profile | undefined) => {
    if (!user) return 'U';
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  const getDealTypeBadgeProps = (dealType: string | null) => {
    if (dealType === 'recurring') {
      return {
        variant: 'default' as const,
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200'
      };
    }
    return {
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200'
    };
  };

  const getClientTypeBadgeProps = (clientType: string | null) => {
    if (clientType === 'web') {
      return {
        variant: 'default' as const,
        className: 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200'
      };
    }
    return {
      variant: 'default' as const,
      className: 'bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200'
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Deal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Deal Description */}
        {deal.description && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Description</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{deal.description}</p>
          </div>
        )}

        {/* Deal Types with colored badges */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Deal Type:</span>
            <Badge {...getDealTypeBadgeProps(deal.deal_type)} className="flex items-center gap-1">
              {deal.deal_type === 'recurring' ? (
                <Repeat className="h-3 w-3" />
              ) : (
                <CircleDollarSign className="h-3 w-3" />
              )}
              <span className="capitalize">{deal.deal_type || 'N/A'}</span>
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Client Type:</span>
            <Badge {...getClientTypeBadgeProps(deal.client_deal_type)} className="flex items-center gap-1">
              {deal.client_deal_type === 'web' ? (
                <Globe className="h-3 w-3" />
              ) : (
                <Megaphone className="h-3 w-3" />
              )}
              <span className="capitalize">{deal.client_deal_type || 'N/A'}</span>
            </Badge>
          </div>
        </div>

        {/* Assigned To with Avatar */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Assigned To:</span>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={assignedUser?.avatar_url || undefined} alt={getAssigneeName(deal.assigned_to, profiles)} />
              <AvatarFallback className="text-xs">{getUserInitials(assignedUser)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">
              {getAssigneeName(deal.assigned_to, profiles)}
            </span>
          </div>
        </div>

        {/* Important Dates */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Created:</span>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{formatDate(deal.created_at)}</span>
            </div>
          </div>
          
          {deal.expected_close_date && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Expected Close:</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{formatDate(deal.expected_close_date)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
