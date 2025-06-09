
import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Deal, Company, Profile, Stage, TempDealCompany, TempDealContact } from '../types/deal';
import { DealPipelineProgress } from './DealPipelineProgress';
import { DealHeaderSection } from './DealHeaderSection';
import { CompanyContactSection } from './CompanyContactSection';
import { DealInfoSection } from './DealInfoSection';
import { DealNotesSection } from './DealNotesSection';
import { useAuth } from '@/contexts/AuthContext';

interface DealDetailsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal;
  companies: Company[];
  profiles: Profile[];
  stages: Stage[];
  tempCompanies: any[];
  tempContacts?: TempDealContact[];
}

export const DealDetailsSidebar: React.FC<DealDetailsSidebarProps> = ({
  isOpen,
  onClose,
  deal,
  companies,
  profiles,
  stages,
  tempCompanies,
  tempContacts = [],
}) => {
  const { isAdmin, isEmployee } = useAuth();
  const canModify = isAdmin || isEmployee;

  return (
    <Drawer open={isOpen} onOpenChange={onClose} direction="right">
      <DrawerContent className="fixed inset-y-0 right-0 z-50 h-full w-[700px] flex flex-col border-l">
        <DrawerHeader className="flex items-center justify-between border-b px-6 py-4">
          <DrawerTitle className="sr-only">Deal Details</DrawerTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            {/* Deal Header with Title and Value */}
            <DealHeaderSection deal={deal} />
            
            {/* Pipeline Progress */}
            <DealPipelineProgress 
              currentStageId={deal.stage_id} 
              stages={stages} 
            />
            
            {/* Company and Contact Information */}
            <CompanyContactSection
              deal={deal}
              companies={companies}
              tempCompanies={tempCompanies}
              tempContacts={tempContacts}
            />
            
            {/* Deal Information */}
            <DealInfoSection 
              deal={deal} 
              profiles={profiles} 
            />
            
            {/* Deal Notes */}
            <DealNotesSection
              dealId={deal.id}
              profiles={profiles}
              canModify={canModify}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
