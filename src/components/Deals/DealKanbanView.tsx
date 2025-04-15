
import React, { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Deal, Stage, Company, Profile } from '@/components/Deals/types/deal';
import { DealCard } from './DealCard';
import { DealDetailsDialog } from './DealDetailsDialog';

interface DealKanbanViewProps {
  deals: Deal[];
  stages: Stage[];
  companies: Company[];
  profiles: Profile[];
  canModify: boolean;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  onMove: (dealId: string, newStageId: string) => void;
}

export function DealKanbanView({
  deals,
  stages,
  companies,
  profiles,
  canModify,
  onEdit,
  onDelete,
  onMove,
}: DealKanbanViewProps) {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  
  const { setNodeRef: setDroppableNodeRef, isOver, active } = useDroppable({
    id: 'droppable',
  });

  const style = {
    backgroundColor: isOver ? 'lightgreen' : 'white',
  };

  const handleDrop = (dealId: string, stageId: string) => {
    if (!canModify) return;
    onMove(dealId, stageId);
  };

  // Wrapper function to adapt the onMove function signature
  const handleMoveDeal = (deal: Deal) => {
    if (!canModify) return;
    if (deal.stage_id) {
      onMove(deal.id, deal.stage_id);
    }
  };

  const Droppable = ({ id, children }: { id: string; children: React.ReactNode }) => {
    const { setNodeRef, isOver, active } = useDroppable({ id });
    const style = {
      backgroundColor: isOver ? 'rgba(0,200,0,0.1)' : 'white',
    };

    return (
      <div ref={setNodeRef} style={style} className="min-h-[200px]">
        {children}
      </div>
    );
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto p-4 min-h-[calc(100vh-13rem)]">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">{stage.name}</h3>
              <span className="text-sm text-gray-500">
                {deals.filter((d) => d.stage_id === stage.id).length}
              </span>
            </div>
            <Droppable id={stage.id}>
              <div className="space-y-4 min-h-[200px]">
                {deals
                  .filter((deal) => deal.stage_id === stage.id)
                  .map((deal) => (
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
            </Droppable>
          </div>
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
