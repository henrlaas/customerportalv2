
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MultiStageCompanyDialog } from '@/components/Companies/MultiStageCompanyDialog';
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

  const handleConvert = () => {
    console.log("Converting temp company to permanent company:", tempCompany.company_name);
    setShowCompanyForm(true);
  };

  const handleClose = () => {
    setShowCompanyForm(false);
    onClose();
  };

  if (showCompanyForm) {
    // Provide comprehensive default values for all required fields
    const defaultValues = {
      name: tempCompany.company_name,
      organization_number: tempCompany.organization_number || '',
      website: tempCompany.website || '',
      client_types: dealType === 'web' ? [CLIENT_TYPES.WEB] : [CLIENT_TYPES.MARKETING],
      mrr: dealValue || 0,
      // Provide default empty strings for all required fields
      phone: '',
      invoice_email: '',
      street_address: '',
      city: '',
      postal_code: '',
      country: '',
      advisor_id: user?.id || '', // Set default advisor to current user
      trial_period: false,
      is_partner: false,
    };

    console.log("ConvertTempCompanyDialog: Providing default values:", defaultValues);

    return (
      <MultiStageCompanyDialog
        isOpen={true}
        onClose={handleClose}
        defaultValues={defaultValues}
        dealId={dealId}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convert Temporary Company?</DialogTitle>
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
