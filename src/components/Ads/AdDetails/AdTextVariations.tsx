
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VariationsProps {
  base: string | null;
  variations: any[];
  label: string;
}

export function AdTextVariations({ base, variations, label }: VariationsProps) {
  if (!base && (!variations || variations.length === 0)) return null;

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="font-semibold mb-2">{label}</div>
        {base && (
          <div className="mb-3">
            <Badge variant="outline" className="mb-1">Base</Badge>
            <div className="text-sm mt-1 bg-muted/50 p-2 rounded">{base}</div>
          </div>
        )}
        {variations?.length > 0 && variations.map((v: any, idx: number) => (
          <div key={idx} className="mb-2">
            <Badge variant="secondary" className="mb-1">Variation {idx + 1}</Badge>
            <div className="text-sm mt-1 bg-muted/50 p-2 rounded">{v.text}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
