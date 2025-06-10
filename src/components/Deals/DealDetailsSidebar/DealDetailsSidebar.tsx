
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[90vw] sm:w-[50vw] lg:w-[45vw] xl:w-[40vw] sm:max-w-none p-0 overflow-hidden">
        <div className="flex flex-col h-full">
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
  );
};
