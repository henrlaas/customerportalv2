
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare } from 'lucide-react';
import { Company, Deal, Profile } from './types/deal';
import { DealNotesList } from './DealNotes/DealNotesList';
import { useAuth } from '@/contexts/AuthContext';
import { DealHeader, CompanyContactCard, DealInfoCard } from './DealDetailsDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        <DialogHeader>
          <DialogTitle className="sr-only">Deal Details</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6 p-1">
          {/* Header Section */}
          <DealHeader deal={deal} profiles={profiles} />
          
          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company & Contact Information */}
            <div className="space-y-6">
              <CompanyContactCard 
                deal={deal} 
                companies={companies} 
                tempCompanies={tempCompanies}
              />
            </div>
            
            {/* Deal Information */}
            <div className="space-y-6">
              <DealInfoCard deal={deal} />
            </div>
          </div>
          
          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DealNotesList
                dealId={deal.id}
                profiles={profiles}
                canModify={canModify}
              />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
