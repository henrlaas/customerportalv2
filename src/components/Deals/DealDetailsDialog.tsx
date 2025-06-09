
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare } from 'lucide-react';
import { Company, Deal, Profile } from './types/deal';
import { DealNotesList } from './DealNotes/DealNotesList';
import { DealHeader } from './DealDetailsDialog/DealHeader';
import { CompanyContactCard } from './DealDetailsDialog/CompanyContactCard';
import { DealInfoCard } from './DealDetailsDialog/DealInfoCard';
import { useAuth } from '@/contexts/AuthContext';

interface DealDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal;
  companies: Company[];
  profiles: Profile[];
  tempCompanies: any;
}

export const DealDetailsDialog = ({
  isOpen,
  onClose,
  deal,
  companies,
  profiles,
  tempCompanies,
}: DealDetailsDialogProps) => {
  const { isAdmin, isEmployee } = useAuth();
  const canModify = isAdmin || isEmployee;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-0">
          <DialogTitle className="sr-only">Deal Details</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <DealHeader deal={deal} profiles={profiles} />
          
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Notes
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CompanyContactCard
                  companyId={deal.company_id}
                  dealId={deal.id}
                  companies={companies}
                  tempCompanies={tempCompanies}
                />
                <DealInfoCard deal={deal} />
              </div>
            </TabsContent>
            
            <TabsContent value="notes">
              <DealNotesList
                dealId={deal.id}
                profiles={profiles}
                canModify={canModify}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
