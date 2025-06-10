
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { Deal, Company, Stage, Profile } from '../types/deal';
import { DealHeaderSection } from './DealHeaderSection';
import { CompanyContactSection } from './CompanyContactSection';
import { DealInfoSection } from './DealInfoSection';
import { DealNotesSection } from './DealNotesSection';
import { DeleteDealDialog } from './DeleteDealDialog';

interface DealDetailsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal;
  companies: Company[];
  profiles: Profile[];
  stages: Stage[];
  canModify: boolean;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
}

export const DealDetailsSidebar = ({
  isOpen,
  onClose,
  deal,
  companies,
  profiles,
  stages,
  canModify,
  onEdit,
  onDelete,
}: DealDetailsSidebarProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch temp company data
  const { data: tempCompany } = useQuery({
    queryKey: ['temp-deal-company', deal.id],
    queryFn: async () => {
      if (deal.company_id) return null;
      
      const { data } = await supabase
        .from('temp_deal_companies')
        .select('*')
        .eq('deal_id', deal.id)
        .maybeSingle();
        
      return data;
    },
    enabled: !deal.company_id
  });

  // Fetch temp contact data
  const { data: tempContact } = useQuery({
    queryKey: ['temp-deal-contact', deal.id],
    queryFn: async () => {
      if (deal.company_id) return null;
      
      const { data } = await supabase
        .from('temp_deal_contacts')
        .select('*')
        .eq('deal_id', deal.id)
        .maybeSingle();
        
      return data;
    },
    enabled: !deal.company_id
  });

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(deal.id);
    setShowDeleteDialog(false);
    onClose();
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-[50vw] max-w-[600px] p-0 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Action buttons positioned at top right */}
            {canModify && (
              <div className="absolute top-4 right-12 z-10 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(deal)}
                  className="h-8 w-8 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="h-8 w-8 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <SheetHeader className="p-6 pb-4 border-b">
              <DealHeaderSection 
                deal={deal} 
                stages={stages}
                onEdit={onEdit}
                onDelete={onDelete}
                canModify={canModify}
              />
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <CompanyContactSection
                deal={deal}
                companies={companies}
                tempCompany={tempCompany}
                tempContact={tempContact}
              />
              
              <DealInfoSection
                deal={deal}
                profiles={profiles}
              />
              
              <DealNotesSection
                dealId={deal.id}
                profiles={profiles}
                canModify={canModify}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <DeleteDealDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        dealTitle={deal.title}
      />
    </>
  );
};
