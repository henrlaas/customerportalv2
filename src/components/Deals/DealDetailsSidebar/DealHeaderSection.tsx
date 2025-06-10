
import React from 'react';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
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
  const currentStage = stages.find(stage => stage.id === deal.stage_id);

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
            {currentStage && (
              <Badge variant="secondary" className="text-xs">
                {currentStage.name}
              </Badge>
            )}
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
