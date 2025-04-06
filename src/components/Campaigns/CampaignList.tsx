
import React from 'react';
import { CampaignCard, Campaign } from './CampaignCard';
import { EmptyState } from './EmptyState';

interface CampaignListProps {
  campaigns: Campaign[];
  isLoading: boolean;
  onCreateClick: () => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({ campaigns, isLoading, onCreateClick }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return <EmptyState onCreateClick={onCreateClick} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
};
