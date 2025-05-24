
import { Button } from '@/components/ui/button';
import { Building, Search } from 'lucide-react';
import { CreationMethod } from './types';

interface CreationMethodStageProps {
  onMethodSelect: (method: CreationMethod) => void;
}

export function CreationMethodStage({ onMethodSelect }: CreationMethodStageProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">How would you like to create the company?</h3>
        <p className="text-sm text-muted-foreground">
          Choose between searching the Norwegian Company Register or creating manually
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-accent"
          onClick={() => onMethodSelect('brunnøysund')}
        >
          <Search className="h-8 w-8 text-blue-600" />
          <div className="text-center">
            <div className="font-medium">Search Brunnøysund</div>
            <div className="text-sm text-muted-foreground">
              Find company in Norwegian Company Register
            </div>
          </div>
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-accent"
          onClick={() => onMethodSelect('manual')}
        >
          <Building className="h-8 w-8 text-green-600" />
          <div className="text-center">
            <div className="font-medium">Create Manually</div>
            <div className="text-sm text-muted-foreground">
              Enter company information manually
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
}
