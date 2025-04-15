
import React from 'react';
import { 
  DndContext, 
  useSensors, 
  useSensor, 
  PointerSensor,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { Card } from '../ui/card';
import { Deal, Stage, Company, Profile } from '@/pages/DealsPage';
import { DealCard } from './DealCard';

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
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!canModify) return;
    
    const { active, over } = event;
    
    if (!active || !over) return;
    
    const dealId = String(active.id);
    const newStageId = String(over.id);
    
    if (dealId && newStageId) {
      onMove(dealId, newStageId);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-4">
        {stages.map((stage) => (
          <div key={stage.id} className="flex flex-col h-full">
            <div className="bg-muted p-3 rounded-t-lg">
              <h3 className="font-semibold">{stage.name}</h3>
            </div>
            <div 
              id={stage.id}
              data-stage-id={stage.id} 
              className="flex-1 p-2 bg-muted/50 rounded-b-lg min-h-[500px]"
            >
              <div className="space-y-2">
                {deals
                  .filter((deal) => deal.stage_id === stage.id)
                  .map((deal) => (
                    <div key={deal.id} className="mb-2">
                      <DealCard
                        deal={deal}
                        companies={companies}
                        stages={stages}
                        profiles={profiles}
                        canModify={canModify}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onMove={(dealToMove) => onMove(dealToMove.id, stage.id)}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
