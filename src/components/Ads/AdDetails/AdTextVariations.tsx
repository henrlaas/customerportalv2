
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface VariationsProps {
  base: string | null;
  variations: any[];
  label: string;
}

export function AdTextVariations({ base, variations, label }: VariationsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!base && (!variations || variations.length === 0)) return null;

  const hasVariations = variations && variations.length > 0;

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between">
            <div className="font-semibold">{label}</div>
            {hasVariations && (
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                {variations.length} variation{variations.length !== 1 ? 's' : ''}
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
            )}
          </div>
          
          <div className="grid gap-3 mt-3">
            {base && (
              <div>
                <Badge variant="outline" className="mb-1">Base</Badge>
                <div className="text-sm mt-1 bg-muted/50 p-2 rounded">{base}</div>
              </div>
            )}
            
            {hasVariations && (
              <CollapsibleContent className="space-y-3">
                {variations.map((v: any, idx: number) => (
                  <div key={idx}>
                    <Badge variant="secondary" className="mb-1">Variation {idx + 1}</Badge>
                    <div className="text-sm mt-1 bg-muted/50 p-2 rounded">{v.text}</div>
                  </div>
                ))}
              </CollapsibleContent>
            )}
          </div>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
