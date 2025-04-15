
import React, { useState } from 'react';
import { 
  DndContext, 
  useSensors, 
  useSensor, 
  PointerSensor,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import ReactConfetti from 'react-confetti';
import { Deal, Stage, Company, Profile } from '@/components/Deals/types/deal';
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

  const [showConfetti, setShowConfetti] = useState(false);
  const [localDeals, setLocalDeals] = useState<Deal[]>(deals);
  
  // Update local deals when props change
  React.useEffect(() => {
    setLocalDeals(deals);
  }, [deals]);

  const handleDragStart = (event: any) => {
    console.log("Drag started:", event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!canModify) return;
    
    const { active, over } = event;
    
    if (!active || !over) return;
    
    const dealId = String(active.id);
    const newStageId = String(over.id);
    
    console.log(`Moving deal ${dealId} to stage ${newStageId}`);
    
    // Make sure we're not dropping on the same stage
    const dealData = localDeals.find(d => d.id === dealId);
    if (dealData && dealData.stage_id !== newStageId) {
      // Find if we're dropping into "Closed Won" stage
      const targetStage = stages.find(s => s.id === newStageId);
      if (targetStage?.name.toLowerCase() === 'closed won') {
        setShowConfetti(true);
        // Hide confetti after 5 seconds
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
      // Optimistic update - update local state immediately
      setLocalDeals(prevDeals => 
        prevDeals.map(deal => 
          deal.id === dealId ? { ...deal, stage_id: newStageId } : deal
        )
      );
      
      // Then persist to database
      onMove(dealId, newStageId);
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-4">
        {stages.map((stage) => (
          <StageColumn 
            key={stage.id}
            stage={stage}
            deals={localDeals.filter(deal => deal.stage_id === stage.id)}
            companies={companies}
            profiles={profiles}
            canModify={canModify}
            onEdit={onEdit}
            onDelete={onDelete}
            onMove={onMove}
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
  onMove: (dealId: string, newStageId: string) => void;
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

  console.log(`Stage ${stage.name} has ${deals.length} deals`);

  return (
    <div key={stage.id} className="flex flex-col h-full">
      <div className="bg-muted p-3 rounded-t-lg">
        <h3 className="font-semibold">{stage.name}</h3>
        <div className="text-xs text-muted-foreground">{deals.length} deals</div>
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
                onMove={() => {}} // This is handled by DragEnd
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
