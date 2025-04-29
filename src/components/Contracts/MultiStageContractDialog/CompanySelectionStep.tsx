
import React from 'react';
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Company {
  id: string;
  name: string;
}

interface CompanySelectionStepProps {
  contractData: {
    company_id: string;
  };
  updateContractData: (data: Partial<{ company_id: string }>) => void;
  companies: Company[];
}

export const CompanySelectionStep: React.FC<CompanySelectionStepProps> = ({ 
  contractData, 
  updateContractData,
  companies
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Company</h2>
      <p className="text-sm text-muted-foreground">
        Select the company this contract is associated with.
      </p>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="company_id">Company *</Label>
          <Select
            value={contractData.company_id}
            onValueChange={(value) => updateContractData({ company_id: value })}
          >
            <SelectTrigger id="company_id">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.length === 0 ? (
                <SelectItem value="no-companies" disabled>No companies available</SelectItem>
              ) : (
                companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
