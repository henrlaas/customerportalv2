
import React from 'react';
import { DollarSign, Repeat, CircleDollarSign, Globe, Megaphone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Deal, Profile } from '@/components/Deals/types/deal';
import { formatCurrency, getAssigneeName } from '@/components/Deals/utils/formatters';

interface DealHeaderProps {
  deal: Deal;
  profiles: Profile[];
}

export const DealHeader: React.FC<DealHeaderProps> = ({ deal, profiles }) => {
  const assignedProfile = profiles.find(p => p.id === deal.assigned_to);

  return (
    <div className="space-y-4">
      {/* Deal Title and Value */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground mb-2">{deal.title}</h2>
          <div className="flex items-center gap-2 text-xl font-semibold text-primary">
            <DollarSign className="h-5 w-5" />
            <span>{formatCurrency(deal.value)}</span>
          </div>
        </div>
        
        {/* Deal Type Badges */}
        <div className="flex gap-2">
          {deal.deal_type === 'recurring' ? (
            <Badge variant="outline" className="flex items-center gap-1">
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
            <Badge variant="secondary" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Web
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Megaphone className="h-3 w-3" />
              Marketing
            </Badge>
          )}
        </div>
      </div>

      {/* Assigned User */}
      {assignedProfile && (
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Avatar className="h-8 w-8">
            <AvatarImage src={assignedProfile.avatar_url || undefined} />
            <AvatarFallback className="text-sm">
              {assignedProfile.first_name?.[0]}{assignedProfile.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">Assigned to</p>
            <p className="font-medium">{getAssigneeName(deal.assigned_to, profiles)}</p>
          </div>
        </div>
      )}
    </div>
  );
};
