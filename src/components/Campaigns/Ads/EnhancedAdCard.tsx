
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Image as ImageIcon, FileText, MoreVertical, Edit, Trash2, Copy } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DeleteAdDialog } from './DeleteAdDialog/DeleteAdDialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  ad: any;
  campaignPlatform?: string;
  onAdUpdate?: () => void;
  disableModifications?: boolean;
}

export function EnhancedAdCard({ ad, disableModifications, onAdUpdate }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getAdTypeInfo = () => {
    if (ad.ad_type === 'image') {
      return { type: 'Image', icon: ImageIcon, color: 'bg-blue-100 text-blue-800' };
    } else if (ad.ad_type === 'video') {
      return { type: 'Video', icon: Play, color: 'bg-purple-100 text-purple-800' };
    } else {
      return { type: 'Text', icon: FileText, color: 'bg-green-100 text-green-800' };
    }
  };

  const adTypeInfo = getAdTypeInfo();

  const handleDuplicate = async () => {
    try {
      const { data: duplicatedAd, error } = await supabase
        .from('ads')
        .insert({
          name: `${ad.name} (Copy)`,
          adset_id: ad.adset_id,
          ad_type: ad.ad_type,
          file_url: ad.file_url,
          file_type: ad.file_type,
          headline: ad.headline,
          description: ad.description,
          main_text: ad.main_text,
          keywords: ad.keywords,
          brand_name: ad.brand_name,
          headline_variations: ad.headline_variations,
          description_variations: ad.description_variations,
          main_text_variations: ad.main_text_variations,
          keywords_variations: ad.keywords_variations,
          url: ad.url,
          cta_button: ad.cta_button,
        });

      if (error) throw error;

      toast({
        title: 'Ad duplicated',
        description: 'The ad has been duplicated successfully.',
      });

      // Refresh the ads list
      await queryClient.invalidateQueries({
        queryKey: ['ads', ad.adset_id]
      });

      onAdUpdate?.();
    } catch (error: any) {
      toast({
        title: 'Error duplicating ad',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSuccess = () => {
    // Refresh the ads list
    queryClient.invalidateQueries({
      queryKey: ['ads', ad.adset_id]
    });
    onAdUpdate?.();
  };

  const renderMediaContent = () => {
    if (ad.ad_type === 'image' && ad.file_url) {
      return (
        <div className="relative h-48 bg-muted overflow-hidden group">
          <img
            src={ad.file_url}
            alt={ad.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>
      );
    } else if (ad.ad_type === 'video' && ad.file_url) {
      return (
        <div className="relative h-48 bg-muted overflow-hidden group cursor-pointer">
          <video
            src={ad.file_url}
            className="w-full h-full object-cover"
            muted
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 group-hover:scale-110 transition-transform duration-200">
              <Play className="h-6 w-6 text-slate-700 ml-1" fill="currentColor" />
            </div>
          </div>
        </div>
      );
    } else {
      // Text-only ad - show content preview
      return (
        <div className="h-48 bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex flex-col justify-center">
          <div className="space-y-3">
            {ad.headline && (
              <h4 className="font-semibold text-slate-900 text-sm line-clamp-2">
                {ad.headline}
              </h4>
            )}
            {ad.main_text && (
              <p className="text-slate-600 text-xs line-clamp-3">
                {ad.main_text}
              </p>
            )}
            {ad.description && (
              <p className="text-slate-500 text-xs line-clamp-2">
                {ad.description}
              </p>
            )}
            {!ad.headline && !ad.main_text && !ad.description && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs">Text-based ad</p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div 
        className="cursor-pointer"
        onClick={() => navigate(`/ads/${ad.id}`)}
      >
        {renderMediaContent()}
      </div>
      
      <CardContent className="p-4">
        {/* Header with title and actions */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate mb-1">{ad.name}</h3>
            <Badge variant="outline" className={`text-xs ${adTypeInfo.color}`}>
              <adTypeInfo.icon className="h-3 w-3 mr-1" />
              {adTypeInfo.type}
            </Badge>
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
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DeleteAdDialog
                  adId={ad.id}
                  adName={ad.name}
                  onSuccess={handleDeleteSuccess}
                  trigger={
                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Ad details */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {ad.cta_button && (
            <div className="flex items-center justify-between">
              <span>CTA:</span>
              <span className="font-medium">{ad.cta_button}</span>
            </div>
          )}
          {ad.url && (
            <div className="flex items-center justify-between">
              <span>URL:</span>
              <span className="truncate ml-2 max-w-32">{ad.url}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
