
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, DollarSign, User, CircleDollarSign, Globe, Megaphone, Repeat, MessageSquare } from 'lucide-react';
import { Company, Deal, Profile } from './types/deal';
import { getAssigneeName, formatCurrency, getCompanyName } from './utils/formatters';
import { DealNotesList } from './DealNotes/DealNotesList';
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{deal.title}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Notes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="flex-1 overflow-y-auto">
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{getCompanyName(deal.company_id, companies, tempCompanies, deal.id)}</span>
                </div>
                <div className="flex gap-2">
                  {deal.deal_type === 'recurring' ? (
                    <Repeat className="h-4 w-4 text-blue-500" aria-label="Recurring deal" />
                  ) : (
                    <CircleDollarSign className="h-4 w-4 text-green-500" aria-label="One-time deal" />
                  )}
                  {deal.client_deal_type === 'web' ? (
                    <Globe className="h-4 w-4 text-purple-500" aria-label="Web deal" />
                  ) : (
                    <Megaphone className="h-4 w-4 text-orange-500" aria-label="Marketing deal" />
                  )}
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{formatCurrency(deal.value)}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <User className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{getAssigneeName(deal.assigned_to, profiles)}</span>
              </div>

              {deal.description && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{deal.description}</p>
                </div>
              )}

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Deal Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Deal Type:</span>
                    <p className="capitalize">{deal.deal_type || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Client Type:</span>
                    <p className="capitalize">{deal.client_deal_type || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notes" className="flex-1 overflow-y-auto">
            <div className="mt-4">
              <DealNotesList
                dealId={deal.id}
                profiles={profiles}
                canModify={canModify}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
