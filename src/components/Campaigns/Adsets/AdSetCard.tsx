
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { CreateAdDialog } from '../Ads/CreateAdDialog';

interface Props {
  adset: {
    id: string;
    name: string;
    targeting: string;
    created_at: string;
  };
}

export function AdSetCard({ adset }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{adset.name}</CardTitle>
        <CreateAdDialog adsetId={adset.id} />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{adset.targeting}</p>
          <p className="text-xs text-muted-foreground">
            Created on {format(new Date(adset.created_at), 'PP')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
