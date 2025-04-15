
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Company } from '@/types/company';
import { companyService } from '@/services/companyService';

interface ExistingCompanyFormProps {
  onNext: (companyId: string) => void;
  onBack: () => void;
}

export const ExistingCompanyForm: React.FC<ExistingCompanyFormProps> = ({
  onNext,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubsidiaries, setShowSubsidiaries] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: companyService.getCompanies,
  });

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesParentStatus = showSubsidiaries || company.parent_id === null;
    return matchesSearch && matchesParentStatus;
  });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search companies..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="show-subsidiaries"
            checked={showSubsidiaries}
            onCheckedChange={setShowSubsidiaries}
          />
          <Label htmlFor="show-subsidiaries">Show subsidiaries</Label>
        </div>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center p-8">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No companies found</p>
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <Card
              key={company.id}
              className={`cursor-pointer transition-colors ${
                selectedCompanyId === company.id ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedCompanyId(company.id)}
            >
              <CardContent className="p-4">
                <div className="font-semibold">{company.name}</div>
                {company.parent_id && (
                  <div className="text-sm text-muted-foreground">
                    Subsidiary
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          disabled={!selectedCompanyId}
          onClick={() => selectedCompanyId && onNext(selectedCompanyId)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
