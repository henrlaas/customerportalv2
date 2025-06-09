
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSensors, useSensor, PointerSensor, useDroppable } from '@dnd-kit/core';
import { supabase } from '@/integrations/supabase/client';
import { Deal, Company, Stage, Profile } from './types/deal';
import { DealCard } from './DealCard';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  isLoading: boolean;
}

export const DealKanbanView: React.FC<DealKanbanViewProps> = ({
  deals,
  stages,
  companies,
  profiles,
  canModify,
  onEdit,
  onDelete,
  onMove,
  isLoading,
}) => {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const dealId = active.id as string;
      const newStageId = over.id as string;

      onMove(dealId, newStageId);
    }
  };

  const { data: tempCompanies = [] } = useQuery({
    queryKey: ['temp-deal-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('temp_deal_companies')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: tempContacts = [] } = useQuery({
    queryKey: ['temp-deal-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('temp_deal_contacts')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const handleViewDetails = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedDeal(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 min-h-[600px]">
        {stages.map(stage => {
          const stageDeals = deals.filter(deal => deal.stage_id === stage.id);

          return (
          <SortableContext key={stage.id} items={stageDeals.map(d => d.id)} strategy={verticalListSortingStrategy}>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[500px]">
              <h3 className="font-semibold text-gray-700">{stage.name}</h3>
              
              <div className="space-y-3 mt-4">
                {stageDeals.map(deal => (
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
            </div>
          </SortableContext>
        )})}
      </div>

      {/* Deal Details Dialog */}
      {selectedDeal && (
        <DealDetailsDialog
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          deal={selectedDeal}
          companies={companies}
          profiles={profiles}
          stages={stages}
          tempCompanies={tempCompanies}
          tempContacts={tempContacts}
        />
      )}
    </DndContext>
  );
};
