
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Platform } from '../types/campaign';
import { requiresMediaUpload } from './types/variations';
import { motion } from 'framer-motion';
import { useAdForm } from './hooks/useAdForm';
import { AdCreationForm } from './components/AdCreationForm';

interface Props {
  adsetId: string;
  campaignPlatform?: string;
  disabled?: boolean;
}

export function CreateAdDialog({ adsetId, campaignPlatform, disabled = false }: Props) {
  const validPlatform = (campaignPlatform as Platform) || 'Meta';
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  
  const {
    form,
    uploading,
    setUploading,
    fileInfo,
    setFileInfo,
    uploadFile,
    collectVariations,
  } = useAdForm(adsetId, campaignPlatform);

  const resetDialog = () => {
    setFileInfo(null);
    form.reset();
  };

  const submitAd = async (data: any) => {
    if (uploading) return;
    
    if (requiresMediaUpload(validPlatform) && !fileInfo) {
      toast({
        title: 'Missing file',
        description: 'Please upload an image or video for your ad.',
        variant: 'destructive',
      });
      return;
    }
    
    setUploading(true);
    let uploadedFile = null;
    
    if (fileInfo) {
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
      const adData = {
        name: data.name,
        adset_id: adsetId,
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
      
      if (validPlatform === 'Google') {
        const { error } = await supabase.from('ads').insert({
          ...adData,
          ad_type: 'text',
          file_url: null,
          file_type: null
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('ads').insert({
          ...adData,
          ad_type: fileInfo?.type || 'text',
          file_url: uploadedFile?.url || null,
          file_type: fileInfo?.file.type || null
        });
        if (error) throw error;
      }
      
      toast({
        title: 'Ad created',
        description: 'Your ad has been created successfully.',
      });
      
      await queryClient.invalidateQueries({
        queryKey: ['ads', adsetId]
      });
      
      setOpen(false);
      resetDialog();
    } catch (error: any) {
      toast({
        title: 'Error creating ad',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetDialog();
    }}>
      <DialogTrigger asChild>
        <Button size="sm" className="transition-all hover:scale-105 hover:shadow-md" disabled={disabled}>
          <Plus className="w-4 h-4 mr-2" />
          Create Ad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm border-primary/10 overflow-hidden">
        <DialogHeader className="p-6 pb-2 flex-shrink-0 border-b">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Create New {validPlatform} Ad
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 overflow-hidden">
          <AdCreationForm
            form={form}
            platform={validPlatform}
            fileInfo={fileInfo}
            setFileInfo={setFileInfo}
            onSubmit={submitAd}
            uploading={uploading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
