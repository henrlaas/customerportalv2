import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MultiStageCompanyDialog } from '@/components/Companies/MultiStageCompanyDialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CLIENT_TYPES } from '@/components/Companies/MultiStageCompanyDialog/ClientTypes';
import { useAuth } from '@/contexts/AuthContext';

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
  dealType,
}: ConvertTempCompanyDialogProps) => {
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const { user } = useAuth();

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
    enabled: isOpen && !!dealId,
  });

  const handleConvert = () => {
    console.log("Converting temp company to permanent company:", tempCompany.company_name);
    setShowCompanyForm(true);
  };

  const handleClose = () => {
    setShowCompanyForm(false);
    onClose();
  };

  if (showCompanyForm) {
    // Use the full temporary company data for pre-filling, with fallbacks
    const companyData = fullTempCompany || tempCompany;
    
    return (
      <MultiStageCompanyDialog
        isOpen={true}
        onClose={handleClose}
        defaultValues={{
          name: companyData.company_name,
          organization_number: companyData.organization_number || '',
          website: companyData.website || '',
          client_types: dealType === 'web' ? [CLIENT_TYPES.WEB] : [CLIENT_TYPES.MARKETING],
          mrr: dealValue || 0,
          // Include address fields from enhanced temp company data with safe fallbacks
          street_address: companyData.street_address || '',
          city: companyData.city || '',
          postal_code: companyData.postal_code || '',
          country: companyData.country || 'Norway',
          // Provide defaults for required fields
          phone: '',
          invoice_email: '',
          advisor_id: user?.id || '',
          trial_period: false,
          is_partner: false,
        }}
        dealId={dealId}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convert Temporary Company?</DialogTitle>
          <DialogDescription>
            Creating a permanent company record will allow you to manage this company and track all future deals with them in one place.
          </DialogDescription>
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
