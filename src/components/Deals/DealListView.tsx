
import React from 'react';
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
  return (
    <div className="space-y-4 p-4">
      {deals.map((deal) => (
        <DealCard
          key={deal.id}
          deal={deal}
          companies={companies}
          stages={stages}
          profiles={profiles}
          canModify={canModify}
          onEdit={onEdit}
          onDelete={onDelete}
          onMove={onMove}
        />
      ))}
    </div>
  );
}
