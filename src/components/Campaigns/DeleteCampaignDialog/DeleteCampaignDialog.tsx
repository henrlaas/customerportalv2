
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Campaign } from '../types/campaign';

interface DeleteCampaignDialogProps {
  campaign: Campaign;
  trigger?: React.ReactNode;
}

export function DeleteCampaignDialog({ campaign, trigger }: DeleteCampaignDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // First, check if there are adsets associated with this campaign
      const { data: adsets, error: adsetError } = await supabase
        .from('adsets')
        .select('id')
        .eq('campaign_id', campaign.id);
      
      if (adsetError) throw adsetError;

      // If adsets exist, we need to delete them and their associated ads
      if (adsets && adsets.length > 0) {
        // Get all adset IDs
        const adsetIds = adsets.map(adset => adset.id);
        
        // Delete all ads associated with these adsets
        const { error: adsError } = await supabase
          .from('ads')
          .delete()
          .in('adset_id', adsetIds);
        
        if (adsError) throw adsError;
        
        // Delete all adsets
        const { error: adsetsDeleteError } = await supabase
          .from('adsets')
          .delete()
          .eq('campaign_id', campaign.id);
        
        if (adsetsDeleteError) throw adsetsDeleteError;
      }

      // Delete any campaign media
      const { error: mediaError } = await supabase
        .from('campaign_media')
        .delete()
        .eq('campaign_id', campaign.id);

      if (mediaError) throw mediaError;

      // Finally, delete the campaign
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaign.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Campaign deleted successfully',
      });

      // Invalidate the campaigns query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the campaign "{campaign.name}"? This action cannot be undone and will also delete all ad sets and ads within this campaign.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
