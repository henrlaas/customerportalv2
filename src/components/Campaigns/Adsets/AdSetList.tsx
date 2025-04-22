
import { AdSetCard } from './AdSetCard';

interface Props {
  adsets: any[];
  campaignId: string;
  onUpdate?: () => void;
  disableModifications?: boolean;
}

export function AdSetList({ adsets, campaignId, onUpdate, disableModifications = false }: Props) {
  if (adsets.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/50">
        <h3 className="text-lg font-medium mb-2">No Ad Sets Yet</h3>
        <p className="text-muted-foreground">Create your first ad set to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {adsets.map((adset) => (
        <AdSetCard key={adset.id} adset={adset} onUpdate={onUpdate} disableModifications={disableModifications} />
      ))}
    </div>
  );
}
