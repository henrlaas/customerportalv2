
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Platform } from '../../types/campaign';
import { requiresMediaUpload } from '../types/variations';
import { useAdForm } from '../hooks/useAdForm';
import { AdCreationForm } from '../components/AdCreationForm';

interface Props {
  ad: any;
  campaignPlatform?: string;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditAdDialog({ ad, campaignPlatform, trigger, open, onOpenChange, onSuccess }: Props) {
  const validPlatform = (campaignPlatform as Platform) || 'Meta';
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  // Use external open state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  
  const {
    form,
    uploading,
    setUploading,
    fileInfo,
    setFileInfo,
    uploadFile,
    collectVariations,
  } = useAdForm(ad.adset_id, campaignPlatform);

  // Prefill form with existing ad data when dialog opens
  React.useEffect(() => {
    if (isOpen && ad) {
      form.reset({
        name: ad.name || '',
        adset_id: ad.adset_id,
        headline: ad.headline || '',
        description: ad.description || '',
        main_text: ad.main_text || '',
        keywords: ad.keywords || '',
        brand_name: ad.brand_name || '',
        url: ad.url || '',
        cta_button: ad.cta_button || '',
        creation_method: 'manual',
        ai_prompt: '',
        ai_language: 'english',
      });

      // Set existing file info if available
      if (ad.file_url) {
        setFileInfo({
          file: null as any, // We don't have the original file object
          url: ad.file_url,
          type: ad.ad_type === 'image' || ad.ad_type === 'video' ? ad.ad_type : 'image',
        });
      }
    }
  }, [isOpen, ad, form]);

  const resetDialog = () => {
    if (!ad.file_url) {
      setFileInfo(null);
    }
    form.reset();
  };

  const submitEdit = async (data: any) => {
    if (uploading) return;
    
    if (requiresMediaUpload(validPlatform) && !fileInfo && !ad.file_url) {
      toast({
        title: 'Missing file',
        description: 'Please upload an image or video for your ad.',
        variant: 'destructive',
      });
      return;
    }
    
    setUploading(true);
    let uploadedFile = null;
    
    // Only upload if there's a new file
    if (fileInfo && fileInfo.file) {
      uploadedFile = await uploadFile(fileInfo.file);
      if (!uploadedFile && requiresMediaUpload(validPlatform)) {
        setUploading(false);
        return;
      }
    }
    
    const headlineVariations = collectVariations('headline');
    const descriptionVariations = collectVariations('description');
    const mainTextVariations = collectVariations('main_text');
    const keywordsVariations = collectVariations('keywords');
    
    try {
      const updateData: any = {
        name: data.name,
        headline: data.headline || null,
        description: data.description || null,
        main_text: data.main_text || null,
        keywords: data.keywords || null,
        brand_name: data.brand_name || null,
        headline_variations: JSON.stringify(headlineVariations),
        description_variations: JSON.stringify(descriptionVariations),
        main_text_variations: JSON.stringify(mainTextVariations),
        keywords_variations: JSON.stringify(keywordsVariations),
        url: data.url || null,
        cta_button: data.cta_button || null,
      };
      
      // Update file info only if a new file was uploaded
      if (uploadedFile) {
        updateData.file_url = uploadedFile.url;
        updateData.file_type = fileInfo?.file?.type || ad.file_type;
        updateData.ad_type = fileInfo?.type || ad.ad_type;
      }
      
      const { error } = await supabase
        .from('ads')
        .update(updateData)
        .eq('id', ad.id);
        
      if (error) throw error;
      
      toast({
        title: 'Ad updated',
        description: 'Your ad has been updated successfully.',
      });
      
      await queryClient.invalidateQueries({
        queryKey: ['ads', ad.adset_id]
      });
      
      setOpen(false);
      resetDialog();
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error updating ad',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetDialog();
    }}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm border-primary/10">
        <DialogHeader className="p-6 pb-2 flex-shrink-0 border-b">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Edit {validPlatform} Ad
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0">
          <AdCreationForm
            form={form}
            platform={validPlatform}
            fileInfo={fileInfo}
            setFileInfo={setFileInfo}
            onSubmit={submitEdit}
            uploading={uploading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
