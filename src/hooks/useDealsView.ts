
import { useState } from 'react';

type ViewType = 'kanban' | 'list';

export function useDealsView() {
  const [currentView, setCurrentView] = useState<ViewType>('kanban');

  const toggleView = () => {
    setCurrentView(prev => prev === 'kanban' ? 'list' : 'kanban');
  };

  return {
    currentView,
    setCurrentView,
    toggleView,
    isKanbanView: currentView === 'kanban'
  };
}
