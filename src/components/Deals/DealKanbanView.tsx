
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
  const handleDragEnd = (result: any) => {
    if (!result.destination || !canModify) return;

    const { draggableId, destination } = result;
    const newStageId = destination.droppableId;
    onMove(draggableId, newStageId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-4">
        {stages.map((stage) => (
          <div key={stage.id} className="flex flex-col h-full">
            <div className="bg-muted p-3 rounded-t-lg">
              <h3 className="font-semibold">{stage.name}</h3>
            </div>
            <Droppable droppableId={stage.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 p-2 bg-muted/50 rounded-b-lg min-h-[500px]"
                >
                  <div className="space-y-2">
                    {deals
                      .filter((deal) => deal.stage_id === stage.id)
                      .map((deal, index) => (
                        <Draggable
                          key={deal.id}
                          draggableId={deal.id}
                          index={index}
                          isDragDisabled={!canModify}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <DealCard
                                deal={deal}
                                companies={companies}
                                stages={stages}
                                profiles={profiles}
                                canModify={canModify}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onMove={onMove}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
