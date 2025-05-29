
import { AdSetCard } from './AdSetCard';

interface Props {
  adsets: any[];
  campaignId: string;
  onUpdate?: () => void;
  disableModifications?: boolean;
  selectedAdsetId?: string | null;
  onSelectAdset?: (adsetId: string) => void;
}

export function AdSetList({
  adsets,
  campaignId,
  onUpdate,
  disableModifications = false,
  selectedAdsetId,
  onSelectAdset,
}: Props) {
  if (adsets.length === 0) {
    return (
      <div className="text-center p-8 rounded-lg bg-muted/30">
        <h3 className="text-lg font-medium mb-2">No Ad Sets Yet</h3>
        <p className="text-muted-foreground text-sm">Create your first ad set to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {adsets.map((adset) => (
        <AdSetCard
          key={adset.id}
          adset={adset}
          onUpdate={onUpdate}
          disableModifications={disableModifications}
          isSelected={adset.id === selectedAdsetId}
          onSelect={() => onSelectAdset?.(adset.id)}
        />
      ))}
    </div>
  );
}
