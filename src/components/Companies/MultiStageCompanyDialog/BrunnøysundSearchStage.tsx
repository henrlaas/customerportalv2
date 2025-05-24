
import { useState } from 'react';
import { Search, Building, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import type { BrregCompany, BrregResponse } from './types';

interface BrunnøysundSearchStageProps {
  onCompanySelect: (company: BrregCompany) => void;
}

export function BrunnøysundSearchStage({ onCompanySelect }: BrunnøysundSearchStageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<BrregCompany[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<BrregCompany | null>(null);
  const { toast } = useToast();

  const searchCompanies = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Search required',
        description: 'Please enter a company name to search',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURIComponent(searchQuery)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search companies');
      }

      const data: BrregResponse = await response.json();
      const companiesData = data._embedded?.enheter || [];
      setCompanies(companiesData);
      
      if (companiesData.length === 0) {
        toast({
          title: 'No companies found',
          description: 'Try adjusting your search terms',
        });
      }
    } catch (error) {
      console.error('Error searching companies:', error);
      toast({
        title: 'Search failed',
        description: 'Failed to search the company registry. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySelect = (company: BrregCompany) => {
    setSelectedCompany(company);
  };

  const handleContinue = () => {
    if (selectedCompany) {
      onCompanySelect(selectedCompany);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="search">Search Company Name</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="search"
              placeholder="Enter company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchCompanies()}
            />
            <Button onClick={searchCompanies} disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
      </div>

      {companies.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Search Results</h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {companies.map((company) => (
              <Card
                key={company.organisasjonsnummer}
                className={`cursor-pointer transition-all ${
                  selectedCompany?.organisasjonsnummer === company.organisasjonsnummer
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleCompanySelect(company)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-start gap-2">
                    <Building className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <div>{company.navn}</div>
                      <div className="text-sm font-normal text-muted-foreground">
                        Org. nr: {company.organisasjonsnummer}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                {company.forretningsadresse && (
                  <CardContent className="pt-0">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <div>
                        {company.forretningsadresse.adresse?.join(', ')}{' '}
                        {company.forretningsadresse.postnummer} {company.forretningsadresse.poststed}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
          
          {selectedCompany && (
            <div className="pt-4 border-t">
              <Button onClick={handleContinue} className="w-full">
                Continue with {selectedCompany.navn}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
