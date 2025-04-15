
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MultiStageCompanyDialog } from '@/components/Companies/MultiStageCompanyDialog';

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

  const handleConvert = () => {
    setShowCompanyForm(true);
  };

  const handleClose = () => {
    setShowCompanyForm(false);
    onClose();
  };

  if (showCompanyForm) {
    return (
      <MultiStageCompanyDialog
        isOpen={true}
        onClose={handleClose}
        defaultValues={{
          name: tempCompany.company_name,
          organization_number: tempCompany.organization_number || '',
          website: tempCompany.website || '',
          client_types: dealType === 'web' ? ['Web'] : ['Marketing'],
          mrr: dealValue || 0,
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
