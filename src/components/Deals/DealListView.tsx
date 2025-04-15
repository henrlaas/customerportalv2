
import React, { useState, useEffect } from 'react';
import { Deal, Stage, Company, Profile } from '@/pages/DealsPage';
import { DealCard } from './DealCard';

interface DealListViewProps {
  deals: Deal[];
  stages: Stage[];
  companies: Company[];
  profiles: Profile[];
  canModify: boolean;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  onMove: (dealId: string, newStageId: string) => void;
}

export function DealListView({
  deals,
  stages,
  companies,
  profiles,
  canModify,
  onEdit,
  onDelete,
  onMove,
}: DealListViewProps) {
  // Track optimistic updates locally
  const [localDeals, setLocalDeals] = useState<Deal[]>(deals);
  
  // Update local deals when props change
  useEffect(() => {
    setLocalDeals(deals);
  }, [deals]);

  const handleMove = (dealToMove: Deal, newStageId: string) => {
    if (!canModify) return;
    
    // Optimistic update - update local state immediately
    setLocalDeals(prevDeals => 
      prevDeals.map(deal => 
        deal.id === dealToMove.id ? { ...deal, stage_id: newStageId } : deal
      )
    );
    
    // Then persist to database
    onMove(dealToMove.id, newStageId);
  };

  return (
    <div className="space-y-4 p-4">
      {localDeals.map((deal) => (
        <DealCard
          key={deal.id}
          deal={deal}
          companies={companies}
          stages={stages}
          profiles={profiles}
          canModify={canModify}
          onEdit={onEdit}
          onDelete={onDelete}
          onMove={(dealToMove) => {
            // In list view, we just update the stage using the current stage
            if (dealToMove.stage_id) {
              handleMove(dealToMove, dealToMove.stage_id);
            }
          }}
        />
      ))}
    </div>
  );
}
