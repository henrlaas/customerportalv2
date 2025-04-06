
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateClick }) => {
  return (
    <div className="text-center p-12 border rounded-lg bg-muted/50">
      <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
      <p className="text-muted-foreground mb-4">Create your first campaign to get started</p>
      <Button onClick={onCreateClick}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Campaign
      </Button>
    </div>
  );
};
