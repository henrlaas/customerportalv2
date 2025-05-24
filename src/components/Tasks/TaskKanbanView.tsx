import React, { useState } from 'react';
import { 
  DndContext, 
  closestCorners, 
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatarGroup } from '@/components/Tasks/UserAvatarGroup';
import { TaskCard } from '@/components/Tasks/TaskCard';
import { Skeleton } from '@/components/ui/skeleton';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'completed';
  priority: string;
  due_date: string | null;
  company_id: string | null;
  campaign_id: string | null;
  project_id: string | null;
  creator_id: string | null;
  client_visible: boolean | null;
  related_type: string | null;
  assignees?: { id: string; user_id: string }[];
}

interface Contact {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url?: string | null;
}

interface TaskKanbanViewProps {
  tasksByStatus: {
    todo: Task[];
    in_progress: Task[];
    completed: Task[];
  };
  getStatusBadge: (status: string) => React.ReactNode;
  getPriorityBadge: (priority: string) => React.ReactNode;
  getTaskAssignees: (task: Task) => Contact[];
  profiles: Contact[];
  onTaskClick: (taskId: string) => void;
  onTaskMove: (taskId: string, newStatus: string) => void;
  getCreatorInfo: (creatorId: string | null) => Contact | null;
  getCompanyName: (companyId: string | null) => string | null;
  getCampaignName: (campaignId: string | null) => string | null;
  getProjectName: (projectId: string | null) => string | null;
  isLoading?: boolean;
}

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasksByStatus,
  getStatusBadge,
  getPriorityBadge,
  getTaskAssignees,
  profiles,
  onTaskClick,
  onTaskMove,
  getCreatorInfo,
  getCompanyName,
  getCampaignName,
  getProjectName,
  isLoading = false
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localTasks, setLocalTasks] = useState<{
    todo: Task[];
    in_progress: Task[];
    completed: Task[];
  }>(tasksByStatus);
  
  // Update local tasks when props change
  React.useEffect(() => {
    setLocalTasks(tasksByStatus);
  }, [tasksByStatus]);
  
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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    // If the task is dragged over a container (status column)
    if (overId === 'todo' || overId === 'in_progress' || overId === 'completed') {
      // We'll handle the actual status update in handleDragEnd
      console.log(`Task ${activeId} dragged over ${overId} status column`);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    // Extract task ID and container ID
    const taskId = active.id as string;
    const overId = over.id;
    
    // Only update if dropping in a valid status container
    if (overId === 'todo' || overId === 'in_progress' || overId === 'completed') {
      // Find the task in our local state
      const findTaskStatus = Object.entries(localTasks).find(([status, tasks]) => 
        tasks.some(task => task.id === taskId)
      );
      
      if (findTaskStatus) {
        const [currentStatus] = findTaskStatus;
        
        // Only proceed if the status has changed
        if (currentStatus !== overId) {
          console.log(`Moving task ${taskId} from ${currentStatus} to ${overId}`);
          
          // Get the task object
          const task = localTasks[currentStatus as keyof typeof localTasks].find(t => t.id === taskId);
          
          if (task) {
            // Update local state for immediate UI feedback (optimistic update)
            setLocalTasks(prev => {
              // Remove from current status
              const updatedPrev = {
                ...prev,
                [currentStatus]: prev[currentStatus as keyof typeof prev].filter(t => t.id !== taskId)
              };
              
              // Add to new status with updated status property
              updatedPrev[overId as keyof typeof updatedPrev] = [
                ...updatedPrev[overId as keyof typeof updatedPrev],
                { ...task, status: overId as 'todo' | 'in_progress' | 'completed' }
              ];
              
              return updatedPrev;
            });
            
            // Call the prop to update in the database
            onTaskMove(taskId, overId as string);
          }
        }
      }
    }
    
    setActiveId(null);
  };

  // Helper function to get count badge
  const getCountBadge = (count: number) => (
    <Badge variant="secondary" className="ml-2">
      {count}
    </Badge>
  );

  // Find the active task across all status categories
  const getActiveTask = () => {
    if (!activeId) return null;
    
    return [
      ...localTasks.todo,
      ...localTasks.in_progress,
      ...localTasks.completed
    ].find(task => task.id === activeId);
  };

  const activeTask = getActiveTask();

  // Loading skeleton for Kanban columns
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Todo column skeleton */}
        <KanbanColumnSkeleton title="Todo" />
        
        {/* In Progress column skeleton */}
        <KanbanColumnSkeleton title="In Progress" />
        
        {/* Completed column skeleton */}
        <KanbanColumnSkeleton title="Completed" />
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
      <div className="container mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Todo column */}
        <TaskStatusColumn 
          id="todo"
          title="Todo"
          tasks={localTasks.todo}
          getCountBadge={getCountBadge}
          getPriorityBadge={getPriorityBadge}
          getTaskAssignees={getTaskAssignees}
          onTaskClick={onTaskClick}
          activeId={activeId}
          getCreatorInfo={getCreatorInfo}
          getCompanyName={getCompanyName}
          getCampaignName={getCampaignName}
          getProjectName={getProjectName}
        />
        
        {/* In Progress column */}
        <TaskStatusColumn 
          id="in_progress"
          title="In Progress"
          tasks={localTasks.in_progress}
          getCountBadge={getCountBadge}
          getPriorityBadge={getPriorityBadge}
          getTaskAssignees={getTaskAssignees}
          onTaskClick={onTaskClick}
          activeId={activeId}
          getCreatorInfo={getCreatorInfo}
          getCompanyName={getCompanyName}
          getCampaignName={getCampaignName}
          getProjectName={getProjectName}
        />
        
        {/* Completed column */}
        <TaskStatusColumn 
          id="completed"
          title="Completed"
          tasks={localTasks.completed}
          getCountBadge={getCountBadge}
          getPriorityBadge={getPriorityBadge}
          getTaskAssignees={getTaskAssignees}
          onTaskClick={onTaskClick}
          activeId={activeId}
          getCreatorInfo={getCreatorInfo}
          getCompanyName={getCompanyName}
          getCampaignName={getCampaignName}
          getProjectName={getProjectName}
        />
      </div>
      
      {/* Add a DragOverlay component to show the task being dragged */}
      <DragOverlay>
        {activeTask ? (
          <div className="opacity-80 w-full max-w-[240px]">
            <TaskCard 
              task={activeTask}
              getPriorityBadge={getPriorityBadge}
              getTaskAssignees={getTaskAssignees}
              onClick={() => {}}
              isDragging={true}
              getCreatorInfo={getCreatorInfo}
              getCompanyName={getCompanyName}
              getCampaignName={getCampaignName}
              getProjectName={getProjectName}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// Kanban column skeleton component
const KanbanColumnSkeleton: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center mb-4">
        <h3 className="font-medium">{title}</h3>
        <Badge variant="secondary" className="ml-2">
          <Skeleton className="h-4 w-6" />
        </Badge>
      </div>
      <div className="space-y-2 min-h-[300px]">
        {Array(3).fill(0).map((_, i) => (
          <Card key={`skeleton-card-${i}`} className="overflow-hidden">
            <CardContent className="p-2">
              <div className="space-y-2">
                <Skeleton className="h-5 w-full mb-1" />
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20" />
                  <div className="flex -space-x-2">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-7 w-7 rounded-full" />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

interface TaskStatusColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  getCountBadge: (count: number) => React.ReactNode;
  getPriorityBadge: (priority: string) => React.ReactNode;
  getTaskAssignees: (task: Task) => Contact[];
  onTaskClick: (taskId: string) => void;
  activeId: string | null;
  getCreatorInfo: (creatorId: string | null) => Contact | null;
  getCompanyName: (companyId: string | null) => string | null;
  getCampaignName: (campaignId: string | null) => string | null;
  getProjectName: (projectId: string | null) => string | null;
}

const TaskStatusColumn: React.FC<TaskStatusColumnProps> = ({
  id,
  title,
  tasks,
  getCountBadge,
  getPriorityBadge,
  getTaskAssignees,
  onTaskClick,
  activeId,
  getCreatorInfo,
  getCompanyName,
  getCampaignName,
  getProjectName
}) => {
  // Set up droppable container for this status column
  const { setNodeRef } = useDroppable({ id });

  return (
    <div id={id} className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center mb-3">
        <h3 className="font-medium">{title}</h3>
        {getCountBadge(tasks.length)}
      </div>
      <div 
        ref={setNodeRef}  
        className="space-y-2 min-h-[300px]"
      >
        <SortableContext 
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {tasks.map(task => (
              <TaskCard 
                key={task.id}
                task={task}
                getPriorityBadge={getPriorityBadge}
                getTaskAssignees={getTaskAssignees}
                onClick={() => onTaskClick(task.id)}
                isDragging={activeId === task.id}
                getCreatorInfo={getCreatorInfo}
                getCompanyName={getCompanyName}
                getCampaignName={getCampaignName}
                getProjectName={getProjectName}
              />
            ))}
            {tasks.length === 0 && (
              <div className="bg-background p-3 rounded-md border border-dashed border-border text-center text-muted-foreground text-sm">
                No tasks
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};
