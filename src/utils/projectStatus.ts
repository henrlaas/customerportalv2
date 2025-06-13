
import { Milestone } from '@/hooks/useProjectMilestones';

export const getProjectStatus = (milestones: Milestone[]): 'completed' | 'in_progress' => {
  if (!milestones || milestones.length === 0) {
    return 'in_progress';
  }
  
  const allCompleted = milestones.every(milestone => milestone.status === 'completed');
  return allCompleted ? 'completed' : 'in_progress';
};

export const getProjectStatusBadge = (status: 'completed' | 'in_progress') => {
  if (status === 'completed') {
    return {
      label: 'Completed',
      className: 'bg-green-100 text-green-800 border-green-200'
    };
  }
  
  return {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-800 border-blue-200'
  };
};
