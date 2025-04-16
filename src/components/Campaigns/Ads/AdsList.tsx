
import { AdCard } from './AdCard';

interface Props {
  ads: any[];
  campaignPlatform?: string;
}

export function AdsList({ ads, campaignPlatform }: Props) {
  if (ads.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/50">
        <h3 className="text-lg font-medium mb-2">No Ads Yet</h3>
        <p className="text-muted-foreground">Create your first ad to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} campaignPlatform={campaignPlatform} />
      ))}
    </div>
  );
}
