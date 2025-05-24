
import { useState } from 'react';
import { Search, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface BrregCompany {
  organisasjonsnummer: string;
  navn: string;
  forretningsadresse?: {
    land?: string;
    postnummer?: string;
    poststed?: string;
    adresse?: string[];
  };
}

interface BrregResponse {
  _embedded?: {
    enheter: BrregCompany[];
  };
}

interface BrunnøysundSearchStageProps {
  onCompanySelect: (company: BrregCompany) => void;
}

export function BrunnøysundSearchStage({ onCompanySelect }: BrunnøysundSearchStageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<BrregCompany[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
      const response = await fetch(`https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search companies');
      }

      const data: BrregResponse = await response.json();
      const foundCompanies = data._embedded?.enheter || [];
      
      setCompanies(foundCompanies);
      
      if (foundCompanies.length === 0) {
        toast({
          title: 'No companies found',
          description: 'Try adjusting your search term',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: 'Unable to search the company registry. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchCompanies();
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Search Norwegian Company Registry</h3>
        <p className="text-sm text-muted-foreground">
          Search for companies in the official Norwegian business registry
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Enter company name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={searchCompanies} disabled={isLoading}>
          <Search className="h-4 w-4 mr-2" />
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {companies.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <h4 className="text-sm font-medium text-muted-foreground">
            Found {companies.length} companies:
          </h4>
          {companies.map((company) => (
            <Card 
              key={company.organisasjonsnummer} 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onCompanySelect(company)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base font-medium leading-tight">
                      {company.navn}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Org. nr: {company.organisasjonsnummer}
                    </p>
                    {company.forretningsadresse && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {company.forretningsadresse.adresse?.join(', ')}, {company.forretningsadresse.poststed}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
