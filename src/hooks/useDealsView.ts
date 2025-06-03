// This file is no longer needed since we removed the view selector
// Keeping it for now in case it's needed in the future
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
