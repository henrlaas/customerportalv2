
import React from 'react';
import { 
  DndContext, 
  useSensors, 
  useSensor, 
  PointerSensor,
  DragEndEvent,
  DragOverlay,
  useDroppable,
  UniqueIdentifier
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { Card } from '../ui/card';
import { Deal, Stage, Company, Profile } from '@/pages/DealsPage';
import { DealCard } from './DealCard';
import { useState } from 'react';

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

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!canModify) return;
    
    const { active, over } = event;
    setActiveId(null);
    
    if (!active || !over) return;
    
    const dealId = String(active.id);
    const newStageId = String(over.id);
    
    // Make sure we're not dropping on the same stage
    const dealData = deals.find(d => d.id === dealId);
    if (dealData && dealData.stage_id !== newStageId) {
      console.log(`Moving deal ${dealId} to stage ${newStageId}`);
      onMove(dealId, newStageId);
    }
  };

  // Find the active deal
  const activeDeal = activeId ? deals.find(deal => deal.id === activeId) : null;

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-4">
        {stages.map((stage) => (
          <StageColumn 
            key={stage.id}
            stage={stage}
            deals={deals.filter(deal => deal.stage_id === stage.id)}
            companies={companies}
            profiles={profiles}
            canModify={canModify}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DndContext>
  );
}

interface StageColumnProps {
  stage: Stage;
  deals: Deal[];
  companies: Company[];
  profiles: Profile[];
  canModify: boolean;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
}

function StageColumn({
  stage,
  deals,
  companies,
  profiles,
  canModify,
  onEdit,
  onDelete
}: StageColumnProps) {
  // Setup the drop area for this stage column
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  return (
    <div key={stage.id} className="flex flex-col h-full">
      <div className="bg-muted p-3 rounded-t-lg">
        <h3 className="font-semibold">{stage.name}</h3>
      </div>
      <div 
        ref={setNodeRef}
        className="flex-1 p-2 bg-muted/50 rounded-b-lg min-h-[500px]"
      >
        <SortableContext items={deals.map(deal => deal.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {deals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                companies={companies}
                stages={[]}
                profiles={profiles}
                canModify={canModify}
                onEdit={onEdit}
                onDelete={onDelete}
                onMove={() => {}} // This is not needed anymore as we're handling moves in DragEnd
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
