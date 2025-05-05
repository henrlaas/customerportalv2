
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
  const [showConvertDialog, setShowConvertDialog] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [tempCompanyData, setTempCompanyData] = useState<any>(null);
  
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
            />
          );
        })}
      </div>
      
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
  onMove
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
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
