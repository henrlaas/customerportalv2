
import React from 'react';

interface EmptyStateProps {
  onCreateClick: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  onCreateClick,
  title = "No campaigns found",
  description = "Create your first campaign to get started",
  buttonText = "Create Campaign"
}) => {
  return (
    <div className="text-center p-12 rounded-xl bg-muted/50 shadow-[rgba(145,158,171,0.2)_0px_0px_2px_0px,rgba(145,158,171,0.12)_0px_12px_24px_-4px]">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
    </div>
  );
};
