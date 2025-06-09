
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MultiStageConvertTempCompanyToCompany } from './MultiStageConvertTempCompanyToCompany';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ConvertTempCompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dealId: string;
  tempCompany: {
    company_name: string;
    organization_number: string | null;
    website: string | null;
    street_address?: string | null;
    city?: string | null;
    postal_code?: string | null;
    country?: string | null;
  };
  dealValue: number | null;
  dealType: string | null;
}

export const ConvertTempCompanyDialog = ({
  isOpen,
  onClose,
  dealId,
  tempCompany,
  dealValue,
  dealType
}: ConvertTempCompanyDialogProps) => {
  const [showConvertDialog, setShowConvertDialog] = useState(false);

  // Fetch complete temporary company data including address fields
  const { data: fullTempCompany } = useQuery({
    queryKey: ['temp-company', dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('temp_deal_companies')
        .select('*')
        .eq('deal_id', dealId)
        .single();
      if (error) {
        console.error('Error fetching temp company:', error);
        return null;
      }
      return data;
    },
    enabled: isOpen && !!dealId
  });

  // Fetch temporary contact data
  const { data: tempContact } = useQuery({
    queryKey: ['temp-contact', dealId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('temp_deal_contacts')
        .select('*')
        .eq('deal_id', dealId)
        .single();
      if (error) {
        console.error('Error fetching temp contact:', error);
        return null;
      }
      return data;
    },
    enabled: isOpen && !!dealId
  });

  const handleConvert = () => {
    setShowConvertDialog(true);
  };

  const handleClose = () => {
    setShowConvertDialog(false);
    onClose();
  };

  if (showConvertDialog) {
    return (
      <MultiStageConvertTempCompanyToCompany
        isOpen={true}
        onClose={handleClose}
        dealId={dealId}
        tempCompany={fullTempCompany || tempCompany}
        tempContact={tempContact}
        dealValue={dealValue}
        dealType={dealType}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convert Temporary Company?</DialogTitle>
          <DialogDescription>Convert company to a client company.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Would you like to create a permanent company record for {tempCompany.company_name}? 
            This will allow you to manage this company and its deals more effectively.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Skip
            </Button>
            <Button onClick={handleConvert}>
              Create Company
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
