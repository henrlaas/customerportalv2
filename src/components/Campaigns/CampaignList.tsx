
import React from 'react';
import { Campaign } from './types/campaign';
import { EmptyState } from './EmptyState';
import { CampaignCardEnhanced } from './CampaignCardEnhanced';
import { motion } from 'framer-motion';

interface CampaignListProps {
  campaigns: Campaign[];
  isLoading: boolean;
  onCreateClick: () => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({ 
  campaigns, 
  isLoading, 
  onCreateClick 
}) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {campaigns.map((campaign, index) => (
        <motion.div
          key={campaign.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3,
            delay: index * 0.05,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        >
          <CampaignCardEnhanced campaign={campaign} />
        </motion.div>
      ))}
    </div>
  );
};
