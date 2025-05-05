
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

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'completed';
  priority: string;
  due_date: string | null;
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
}

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasksByStatus,
  getStatusBadge,
  getPriorityBadge,
  getTaskAssignees,
  profiles,
  onTaskClick,
  onTaskMove,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  
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
    // No need to implement for this simple kanban
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    // Extract task ID and container ID
    const taskId = active.id as string;
    const containerId = over.id as string;
    
    // Only update if dropping in a different container
    if (containerId !== 'todo' && containerId !== 'in_progress' && containerId !== 'completed') {
      setActiveId(null);
      return;
    }
    
    // Get the task
    const task = [
      ...tasksByStatus.todo,
      ...tasksByStatus.in_progress,
      ...tasksByStatus.completed
    ].find(t => t.id === taskId);
    
    if (task && task.status !== containerId) {
      onTaskMove(taskId, containerId);
    }
    
    setActiveId(null);
  };

  // Helper function to get count badge
  const getCountBadge = (count: number) => (
    <Badge variant="secondary" className="ml-2">
      {count}
    </Badge>
  );

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Todo column */}
        <div id="todo" className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <h3 className="font-medium">Todo</h3>
            {getCountBadge(tasksByStatus.todo.length)}
          </div>
          <SortableContext 
            items={tasksByStatus.todo.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {tasksByStatus.todo.map(task => (
                <TaskCard 
                  key={task.id}
                  task={task}
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                  getTaskAssignees={getTaskAssignees}
                  onClick={() => onTaskClick(task.id)}
                  isDragging={activeId === task.id}
                />
              ))}
              {tasksByStatus.todo.length === 0 && (
                <div className="bg-background p-4 rounded-md border border-dashed border-border text-center text-muted-foreground">
                  No tasks
                </div>
              )}
            </div>
          </SortableContext>
        </div>
        
        {/* In Progress column */}
        <div id="in_progress" className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <h3 className="font-medium">In Progress</h3>
            {getCountBadge(tasksByStatus.in_progress.length)}
          </div>
          <SortableContext 
            items={tasksByStatus.in_progress.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {tasksByStatus.in_progress.map(task => (
                <TaskCard 
                  key={task.id}
                  task={task}
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                  getTaskAssignees={getTaskAssignees}
                  onClick={() => onTaskClick(task.id)}
                  isDragging={activeId === task.id}
                />
              ))}
              {tasksByStatus.in_progress.length === 0 && (
                <div className="bg-background p-4 rounded-md border border-dashed border-border text-center text-muted-foreground">
                  No tasks
                </div>
              )}
            </div>
          </SortableContext>
        </div>
        
        {/* Completed column */}
        <div id="completed" className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <h3 className="font-medium">Completed</h3>
            {getCountBadge(tasksByStatus.completed.length)}
          </div>
          <SortableContext 
            items={tasksByStatus.completed.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {tasksByStatus.completed.map(task => (
                <TaskCard 
                  key={task.id}
                  task={task}
                  getStatusBadge={getStatusBadge}
                  getPriorityBadge={getPriorityBadge}
                  getTaskAssignees={getTaskAssignees}
                  onClick={() => onTaskClick(task.id)}
                  isDragging={activeId === task.id}
                />
              ))}
              {tasksByStatus.completed.length === 0 && (
                <div className="bg-background p-4 rounded-md border border-dashed border-border text-center text-muted-foreground">
                  No tasks
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </div>
    </DndContext>
  );
};
