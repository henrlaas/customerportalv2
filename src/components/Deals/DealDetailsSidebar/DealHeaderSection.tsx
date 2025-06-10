
import React from 'react';
import { Edit, Trash2, MoreVertical, Repeat, CircleDollarSign, Globe, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Deal, Stage } from '../types/deal';
import { formatCurrency } from '../utils/formatters';
import { DealPipelineProgress } from './DealPipelineProgress';

interface DealHeaderSectionProps {
  deal: Deal;
  stages: Stage[];
  canModify: boolean;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
}

export const DealHeaderSection = ({
  deal,
  stages,
  canModify,
  onEdit,
  onDelete,
}: DealHeaderSectionProps) => {
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
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            {deal.title}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xl font-semibold text-green-600">
              {formatCurrency(deal.value)}
            </span>
            
            {/* Deal Types with colored badges - moved here */}
            <div className="flex gap-2">
              <Badge {...getDealTypeBadgeProps(deal.deal_type)} className="flex items-center gap-1">
                {deal.deal_type === 'recurring' ? (
                  <Repeat className="h-3 w-3" />
                ) : (
                  <CircleDollarSign className="h-3 w-3" />
                )}
                <span className="capitalize">{deal.deal_type || 'One-time'}</span>
              </Badge>
              
              <Badge {...getClientTypeBadgeProps(deal.client_deal_type)} className="flex items-center gap-1">
                {deal.client_deal_type === 'web' ? (
                  <Globe className="h-3 w-3" />
                ) : (
                  <Megaphone className="h-3 w-3" />
                )}
                <span className="capitalize">{deal.client_deal_type || 'Marketing'}</span>
              </Badge>
            </div>
          </div>
        </div>
        
        {canModify && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(deal)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Deal
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600" 
                onClick={() => onDelete(deal.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Deal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      <DealPipelineProgress deal={deal} stages={stages} />
    </div>
  );
};
