import React, { useState } from 'react';
import { 
  DndContext, 
  useSensors, 
  useSensor, 
  PointerSensor,
  DragEndEvent,
  useDroppable,
  DragStartEvent,
  DragOverEvent,
  KeyboardSensor,
  closestCorners,
  DragOverlay
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  sortableKeyboardCoordinates 
} from '@dnd-kit/sortable';
import ReactConfetti from 'react-confetti';
import { Deal, Stage, Company, Profile } from '@/components/Deals/types/deal';
import { DealCard } from './DealCard';
import { DealKanbanViewSkeleton } from './DealKanbanViewSkeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ConvertTempCompanyDialog } from './ConvertTempCompanyDialog';
import { formatCurrency } from '../Deals/utils/formatters';

interface DealKanbanViewProps {
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

export function DealKanbanView({
  deals,
  stages,
  companies,
  profiles,
  canModify,
  onEdit,
  onDelete,
  onMove,
  isLoading = false,
}: DealKanbanViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [showConfetti, setShowConfetti] = useState(false);
  const [localDeals, setLocalDeals] = useState<Deal[]>(deals);
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [tempCompanyData, setTempCompanyData] = useState<any>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Update local deals when props change
  React.useEffect(() => {
    setLocalDeals(deals);
    console.log("DealKanbanView received deals:", deals.length);
  }, [deals]);

  // Fetch temp company info 
  const { data: tempCompanies } = useQuery({
    queryKey: ['temp-deal-companies'],
    queryFn: async () => {
      const { data } = await supabase
        .from('temp_deal_companies')
        .select('*');
      console.log("Temp companies fetched:", data?.length);
      return data || [];
    },
  });

  if (isLoading) {
    return <DealKanbanViewSkeleton />;
  }

  const handleDragStart = (event: DragStartEvent) => {
    console.log("Drag started:", event.active.id);
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // This can be used for visual feedback during dragging
    // Or for more complex logic like sorting within columns
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    
    if (!canModify) return;
    
    const { active, over } = event;
    
    if (!active || !over) return;
    
    const dealId = String(active.id);
    const newStageId = String(over.id);
    
    console.log(`Moving deal ${dealId} to stage ${newStageId}`);
    
    // Check if we're dropping into "Closed Won" stage
    const targetStage = stages.find(s => s.id === newStageId);
    const deal = deals.find(d => d.id === dealId);
    const tempCompany = tempCompanies?.find(tc => tc.deal_id === dealId);
    
    console.log("Target stage:", targetStage?.name);
    console.log("Deal has company_id:", deal?.company_id ? "Yes" : "No");
    console.log("Temp company found:", tempCompany ? "Yes" : "No");
    
    // Make sure we're not dropping on the same stage
    const dealData = localDeals.find(d => d.id === dealId);
    if (!dealData || dealData.stage_id === newStageId) return;
    
    // First, update the deal's stage (optimistic update)
    setLocalDeals(prevDeals => 
      prevDeals.map(deal => 
        deal.id === dealId ? { ...deal, stage_id: newStageId } : deal
      )
    );
    
    // Persist to database
    onMove(dealId, newStageId);
    
    // Show confetti if moving to "Closed Won"
    if (targetStage?.name.toLowerCase() === 'closed won') {
      setShowConfetti(true);
      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);
      
      // Check if we need to show the convert dialog
      if (!deal?.company_id && tempCompany) {
        // Wait 500ms before showing the dialog to let the drag animation complete
        setTimeout(() => {
          setSelectedDeal(deal);
          setTempCompanyData(tempCompany);
          setShowConvertDialog(true);
        }, 500);
      }
    }
  };

  // Find active deal for the drag overlay
  const activeDeal = activeId ? localDeals.find(deal => deal.id === activeId) : null;

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto">
        {stages.map((stage) => {
          const stageDeals = localDeals.filter(deal => deal.stage_id === stage.id);
          const stageTotalValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
          
          return (
            <StageColumn 
              key={stage.id}
              stage={stage}
              deals={stageDeals}
              totalValue={stageTotalValue}
              companies={companies}
              profiles={profiles}
              canModify={canModify}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
              activeId={activeId}
            />
          );
        })}
      </div>
      
      {/* Add DragOverlay component for a better dragging experience */}
      <DragOverlay>
        {activeDeal ? (
          <div className="opacity-80 w-full max-w-[250px]">
            <DealCard
              deal={activeDeal}
              companies={companies}
              stages={stages}
              profiles={profiles}
              canModify={false} // Disable interactions while dragging
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={() => {}} // No-op for the overlay
            />
          </div>
        ) : null}
      </DragOverlay>
      
      {showConvertDialog && selectedDeal && tempCompanyData && (
        <ConvertTempCompanyDialog
          isOpen={showConvertDialog}
          onClose={() => {
            setShowConvertDialog(false);
            setSelectedDeal(null);
            setTempCompanyData(null);
          }}
          dealId={selectedDeal.id}
          tempCompany={tempCompanyData}
          dealValue={selectedDeal.value}
          dealType={selectedDeal.client_deal_type}
        />
      )}
    </DndContext>
  );
}

interface StageColumnProps {
  stage: Stage;
  deals: Deal[];
  totalValue: number;
  companies: Company[];
  profiles: Profile[];
  canModify: boolean;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
  onMove: (dealId: string, newStageId: string) => void;
  activeId: string | null;
}

function StageColumn({
  stage,
  deals,
  totalValue,
  companies,
  profiles,
  canModify,
  onEdit,
  onDelete,
  onMove,
  activeId
}: StageColumnProps) {
  // Setup the drop area for this stage column
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  return (
    <div key={stage.id} className="flex flex-col h-full min-w-[250px]">
      <div className="bg-muted p-3 rounded-t-lg">
        <h3 className="font-semibold">{stage.name}</h3>
        <div className="text-xs text-muted-foreground">{formatCurrency(totalValue)}</div>
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
            {deals.length === 0 && (
              <div className="bg-background p-4 rounded-md border border-dashed border-border text-center text-muted-foreground">
                No deals in this stage
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
