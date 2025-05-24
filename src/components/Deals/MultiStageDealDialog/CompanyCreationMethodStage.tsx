
import { Building, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type CreationMethod = 'manual' | 'brunnøysund';

interface CompanyCreationMethodStageProps {
  onSelect: (method: CreationMethod) => void;
}

export function CompanyCreationMethodStage({ onSelect }: CompanyCreationMethodStageProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">How would you like to create the company?</h3>
        <p className="text-sm text-muted-foreground">
          Choose between searching the Norwegian company registry or creating manually
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onSelect('brunnøysund')}>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">From Brunnøysund</CardTitle>
            <CardDescription>
              Search the official Norwegian company registry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Search Registry
            </Button>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onSelect('manual')}>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Manual Creation</CardTitle>
            <CardDescription>
              Fill out all company information manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Create Manually
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
