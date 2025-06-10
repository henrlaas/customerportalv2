
import React from 'react';
import { Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Deal
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
