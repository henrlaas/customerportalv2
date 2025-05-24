
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Search, Building, Loader2, CheckCircle } from 'lucide-react';
import { BrunnøysundCompany, BrunnøysundResponse } from './types';

interface BrunnøysundSearchStageProps {
  onCompanySelect: (company: BrunnøysundCompany) => void;
  selectedCompany: BrunnøysundCompany | null;
}

const searchBrunnøysund = async (searchTerm: string): Promise<BrunnøysundResponse> => {
  if (!searchTerm.trim()) {
    return { _embedded: { enheter: [] }, page: { size: 0, totalElements: 0, totalPages: 0, number: 0 } };
  }
  
  const response = await fetch(`https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURIComponent(searchTerm)}`);
  if (!response.ok) {
    throw new Error('Failed to search companies');
  }
  return response.json();
};

export function BrunnøysundSearchStage({ onCompanySelect, selectedCompany }: BrunnøysundSearchStageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['brunnøysund-search', searchTerm],
    queryFn: () => searchBrunnøysund(searchTerm),
    enabled: hasSearched && searchTerm.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setHasSearched(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const companies = data?._embedded?.enheter || [];

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="search" className="flex items-center gap-2 mb-2">
          <Search className="h-4 w-4" />
          Search Norwegian Company Register
        </Label>
        <div className="flex gap-2">
          <Input
            id="search"
            placeholder="Enter company name to search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleSearch}
            disabled={!searchTerm.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          Failed to search companies. Please try again.
        </div>
      )}

      {hasSearched && !isLoading && companies.length === 0 && searchTerm.trim() && (
        <div className="text-center text-muted-foreground py-8">
          <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No companies found for "{searchTerm}"</p>
          <p className="text-sm">Try a different search term</p>
        </div>
      )}

      {companies.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium">
            Found {data?.page.totalElements} companies
          </div>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {companies.map((company) => (
              <Card
                key={company.organisasjonsnummer}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCompany?.organisasjonsnummer === company.organisasjonsnummer
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : ''
                }`}
                onClick={() => onCompanySelect(company)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{company.navn}</div>
                      <div className="text-sm text-muted-foreground">
                        Org. nr: {company.organisasjonsnummer}
                      </div>
                      {company.forretningsadresse && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {company.forretningsadresse.adresse?.[0]}, {company.forretningsadresse.poststed}
                        </div>
                      )}
                    </div>
                    {selectedCompany?.organisasjonsnummer === company.organisasjonsnummer && (
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedCompany && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Company selected: {selectedCompany.navn}</span>
          </div>
        </div>
      )}
    </div>
  );
}
