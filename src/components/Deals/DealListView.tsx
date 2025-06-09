
import React, { useState, useEffect } from 'react';
import { Deal, Stage, Company, Profile } from '@/components/Deals/types/deal';
import { DealCard } from './DealCard';
import { DealListViewSkeleton } from './DealListViewSkeleton';

interface DealListViewProps {
  deals: Deal[];
  stages: Stage[];
  companies: Company[];
  profiles: Profile[];
  canModify: boolean;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  onMove: (dealId: string, newStageId: string) => void;
  isLoading?: boolean;
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
  isLoading = false,
}: DealListViewProps) {
  // Track optimistic updates locally
  const [localDeals, setLocalDeals] = useState<Deal[]>(deals);
  
  // Update local deals when props change
  useEffect(() => {
    setLocalDeals(deals);
  }, [deals]);

  const handleViewDetails = (deal: Deal) => {
    // This function can be used to open deal details
    console.log('View details for deal:', deal.id);
  };

  if (isLoading) {
    return <DealListViewSkeleton />;
  }

  return (
    <div className="space-y-4 w-full">
      {localDeals.map((deal) => (
        <DealCard
          key={deal.id}
          deal={deal}
          companies={companies}
          profiles={profiles}
          stages={stages}
          canModify={canModify}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={handleViewDetails}
        />
      ))}
    </div>
  );
}
