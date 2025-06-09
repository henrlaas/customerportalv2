
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Repeat, CircleDollarSign, Globe, Megaphone } from 'lucide-react';
import { Deal, Profile } from '../types/deal';
import { formatCurrency, getAssigneeName } from '../utils/formatters';

interface DealHeaderProps {
  deal: Deal;
  profiles: Profile[];
}

export const DealHeader: React.FC<DealHeaderProps> = ({ deal, profiles }) => {
  const assignee = profiles.find(p => p.id === deal.assigned_to);

  return (
    <div className="border-b pb-4 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{deal.title}</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center text-green-600 font-semibold">
              <DollarSign className="h-5 w-5 mr-1" />
              {formatCurrency(deal.value)}
            </div>
            <div className="flex gap-2">
              {deal.deal_type === 'recurring' ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Repeat className="h-3 w-3" />
                  Recurring
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  <CircleDollarSign className="h-3 w-3" />
                  One-time
                </Badge>
              )}
              {deal.client_deal_type === 'web' ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Web Development
                </Badge>
              ) : (
                <Badge variant="default" className="flex items-center gap-1 bg-orange-500">
                  <Megaphone className="h-3 w-3" />
                  Marketing
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {assignee && (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>Assigned to:</span>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={assignee.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {assignee.first_name?.[0]}{assignee.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{getAssigneeName(deal.assigned_to, profiles)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
