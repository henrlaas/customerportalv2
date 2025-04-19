
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateAdDialog } from '../Ads/CreateAdDialog';
import { EditAdSetDialog } from './EditAdSetDialog';
import { DeleteAdSetDialog } from './DeleteAdSetDialog';
import { Link } from 'react-router-dom';

interface Props {
  adset: any;
  onUpdate?: () => void;
}

export function AdSetCard({ adset, onUpdate }: Props) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Link to={`/adsets/${adset.id}`} className="hover:underline">
            <CardTitle className="text-lg">{adset.name}</CardTitle>
          </Link>
          <div className="flex items-center gap-1">
            <EditAdSetDialog adset={adset} onSuccess={onUpdate} />
            <DeleteAdSetDialog 
              adsetId={adset.id} 
              adsetName={adset.name} 
              onSuccess={onUpdate} 
            />
            <CreateAdDialog adsetId={adset.id} campaignPlatform={adset.campaigns?.platform} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        {adset.targeting && (
          <p className="text-muted-foreground">
            <span className="font-medium">Targeting:</span> {adset.targeting}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
