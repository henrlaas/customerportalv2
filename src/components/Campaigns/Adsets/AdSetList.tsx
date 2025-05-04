
import { EditAdSetDialog } from './EditAdSetDialog';
import { DeleteAdSetDialog } from './DeleteAdSetDialog';
import { Button } from '@/components/ui/button';

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
      <div className="text-center p-8 border rounded-lg bg-muted/50">
        <h3 className="text-lg font-medium mb-2">No Ad Sets Yet</h3>
        <p className="text-muted-foreground">Create your first ad set to get started.</p>
      </div>
    );
  }

  return (
    <nav className="flex flex-col gap-2">
      {adsets.map((adset) => {
        const selected = adset.id === selectedAdsetId;
        return (
          <div
            key={adset.id}
            tabIndex={0}
            className={`
              group flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer border
              ${selected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/80 border-transparent'}
              focus:outline-none
            `}
            aria-current={selected}
            onClick={() => onSelectAdset?.(adset.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') onSelectAdset?.(adset.id);
            }}
          >
            <div className="flex flex-col min-w-0 flex-1">
              <span className={`font-medium text-[15px] truncate ${selected ? 'text-primary' : 'text-foreground'}`}>
                {adset.name}
              </span>
              {adset.targeting && (
                <span className="text-xs text-muted-foreground truncate">{adset.targeting}</span>
              )}
            </div>
            <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <EditAdSetDialog
                adset={adset}
                onSuccess={onUpdate}
                disabled={disableModifications}
                trigger={
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 w-7"
                    tabIndex={-1}
                    aria-label="Edit"
                  >
                    <span className="sr-only">Edit</span>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7.5 21H3v-4.5L16.732 3.732z" /></svg>
                  </Button>
                }
              />
              <DeleteAdSetDialog
                adsetId={adset.id}
                adsetName={adset.name}
                onSuccess={onUpdate}
                disabled={disableModifications}
                trigger={
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-7 w-7 text-destructive"
                    tabIndex={-1}
                    aria-label="Delete"
                  >
                    <span className="sr-only">Delete</span>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                  </Button>
                }
              />
            </div>
          </div>
        );
      })}
    </nav>
  );
}
