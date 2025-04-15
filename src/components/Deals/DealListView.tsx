
import React, { useState, useEffect } from 'react';
import { Deal, Stage, Company, Profile } from './types/deal';
import { DealCard } from './DealCard';
import { DealDetailsDialog } from './DealDetailsDialog';

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
  const [localDeals, setLocalDeals] = useState<Deal[]>(deals);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  
  useEffect(() => {
    setLocalDeals(deals);
  }, [deals]);

  const handleMove = (dealToMove: Deal, newStageId: string) => {
    if (!canModify) return;
    
    setLocalDeals(prevDeals => 
      prevDeals.map(deal => 
        deal.id === dealToMove.id ? { ...deal, stage_id: newStageId } : deal
      )
    );
    
    onMove(dealToMove.id, newStageId);
  };

  // Wrapper function to adapt the onMove function signature
  const handleMoveDeal = (deal: Deal) => {
    if (!canModify || !deal.stage_id) return;
    handleMove(deal, deal.stage_id);
  };

  return (
    <>
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
            onMove={handleMoveDeal}
            onClick={setSelectedDeal}
          />
        ))}
      </div>

      <DealDetailsDialog
        deal={selectedDeal}
        companies={companies}
        profiles={profiles}
        isOpen={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
      />
    </>
  );
}
