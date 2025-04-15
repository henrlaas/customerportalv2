
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Building } from 'lucide-react';

interface CompanySelectionFormProps {
  onNext: (selection: 'existing' | 'new') => void;
}

export const CompanySelectionForm: React.FC<CompanySelectionFormProps> = ({ onNext }) => {
  const [selection, setSelection] = useState<'existing' | 'new' | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-4">
        <Building className="h-12 w-12 text-primary" />
      </div>
      
      <RadioGroup
        className="gap-4"
        onValueChange={(value) => setSelection(value as 'existing' | 'new')}
      >
        <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-primary">
          <RadioGroupItem value="existing" id="existing" />
          <Label htmlFor="existing" className="flex-1 cursor-pointer">
            <div className="font-semibold">Existing Company</div>
            <div className="text-sm text-muted-foreground">Select from your list of companies</div>
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-primary">
          <RadioGroupItem value="new" id="new" />
          <Label htmlFor="new" className="flex-1 cursor-pointer">
            <div className="font-semibold">New Company</div>
            <div className="text-sm text-muted-foreground">Create a new temporary company</div>
          </Label>
        </div>
      </RadioGroup>

      <div className="flex justify-end">
        <Button
          disabled={!selection}
          onClick={() => selection && onNext(selection)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
