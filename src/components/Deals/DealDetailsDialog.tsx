
import React from 'react';
import { Company, Deal, Profile, Stage } from './types/deal';
import { DealDetailsSidebar } from './DealDetailsSidebar';

interface DealDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal;
  companies: Company[];
  profiles: Profile[];
  stages: Stage[];
  tempCompanies: any;
}

export const DealDetailsDialog = ({
  isOpen,
  onClose,
  deal,
  companies,
  profiles,
  stages,
  tempCompanies,
}: DealDetailsDialogProps) => {
  return (
    <DealDetailsSidebar
      isOpen={isOpen}
      onClose={onClose}
      deal={deal}
      companies={companies}
      profiles={profiles}
      stages={stages}
      tempCompanies={tempCompanies}
    />
  );
};
