
import { EnhancedAdCard } from './EnhancedAdCard';

interface Props {
  ads: any[];
  campaignPlatform?: string;
  disableModifications?: boolean;
  onAdUpdate?: () => void;
}

export function AdsList({ ads, campaignPlatform, disableModifications, onAdUpdate }: Props) {
  if (ads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-2">No ads created yet</div>
        <div className="text-sm text-muted-foreground">
          Create your first ad to get started with your campaign.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ads.map((ad) => (
        <EnhancedAdCard
          key={ad.id}
          ad={ad}
          campaignPlatform={campaignPlatform}
          disableModifications={disableModifications}
          onAdUpdate={onAdUpdate}
        />
      ))}
    </div>
  );
}
