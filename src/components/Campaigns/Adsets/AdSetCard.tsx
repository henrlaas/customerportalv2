
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateAdDialog } from '../Ads/CreateAdDialog';
import { Link } from 'react-router-dom';

interface Props {
  adset: any;
}

export function AdSetCard({ adset }: Props) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Link to={`/adsets/${adset.id}`} className="hover:underline">
            <CardTitle className="text-lg">{adset.name}</CardTitle>
          </Link>
          <CreateAdDialog adsetId={adset.id} campaignPlatform={adset.campaigns?.platform} />
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
