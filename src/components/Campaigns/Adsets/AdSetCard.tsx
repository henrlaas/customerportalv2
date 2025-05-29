
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MoreVertical, Image, Video, FileText } from 'lucide-react';
import { EditAdSetDialog } from './EditAdSetDialog';
import { DeleteAdSetDialog } from './DeleteAdSetDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  adset: any;
  onUpdate?: () => void;
  disableModifications?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function AdSetCard({ adset, onUpdate, disableModifications = false, isSelected, onSelect }: Props) {
  // Fetch ads for this adset to show statistics
  const { data: ads = [] } = useQuery({
    queryKey: ['ads', adset.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('ads')
        .select('*')
        .eq('adset_id', adset.id);
      return data || [];
    },
  });

  const imageAds = ads.filter(ad => ad.ad_type === 'image').length;
  const videoAds = ads.filter(ad => ad.ad_type === 'video').length;
  const textAds = ads.filter(ad => ad.ad_type === 'text' || !ad.ad_type).length;

  // Get preview thumbnails (first 3 ads with media)
  const previewAds = ads.filter(ad => ad.file_url).slice(0, 3);

  return (
    <Card 
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-md group relative
        ${isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:bg-accent/50'}
      `}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        {/* Header with name and actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
              {adset.name}
            </h3>
            {adset.targeting && (
              <p className="text-xs text-muted-foreground truncate mt-1">
                {adset.targeting}
              </p>
            )}
          </div>
          
          {!disableModifications && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <EditAdSetDialog 
                    adset={adset} 
                    onSuccess={onUpdate}
                    disabled={disableModifications}
                    trigger={
                      <Button variant="ghost" className="w-full justify-start">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    } 
                  />
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <DeleteAdSetDialog 
                    adsetId={adset.id} 
                    adsetName={adset.name} 
                    onSuccess={onUpdate}
                    disabled={disableModifications}
                    trigger={
                      <Button variant="ghost" className="w-full justify-start text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    } 
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Ad statistics */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total Ads</span>
            <Badge variant="secondary" className="text-xs">
              {ads.length}
            </Badge>
          </div>
          
          {ads.length > 0 && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {imageAds > 0 && (
                <div className="flex items-center gap-1">
                  <Image className="h-3 w-3" />
                  <span>{imageAds}</span>
                </div>
              )}
              {videoAds > 0 && (
                <div className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  <span>{videoAds}</span>
                </div>
              )}
              {textAds > 0 && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>{textAds}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preview thumbnails */}
        {previewAds.length > 0 && (
          <div className="flex gap-1 overflow-hidden">
            {previewAds.map((ad, index) => (
              <div key={ad.id} className="w-8 h-8 rounded bg-muted overflow-hidden flex-shrink-0">
                {ad.ad_type === 'image' ? (
                  <img 
                    src={ad.file_url} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                ) : ad.ad_type === 'video' ? (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                    <Video className="h-3 w-3 text-slate-500" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <FileText className="h-3 w-3 text-slate-400" />
                  </div>
                )}
              </div>
            ))}
            {previewAds.length < ads.length && (
              <div className="w-8 h-8 rounded bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">
                +{ads.length - previewAds.length}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
