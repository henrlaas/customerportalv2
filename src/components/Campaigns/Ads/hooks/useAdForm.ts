
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdFormData, Platform } from '../../types/campaign';
import { FileInfo } from '../types';
import { TextVariation } from '../types';

export const useAdForm = (adsetId: string, campaignPlatform?: string) => {
  const [uploading, setUploading] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AdFormData>({
    defaultValues: {
      name: '',
      adset_id: adsetId,
      headline: '',
      description: '',
      main_text: '',
      keywords: '',
      brand_name: '',
      cta_button: '',
      url: '',
      creation_method: 'manual',
      ai_prompt: '',
      ai_language: 'english',
    },
  });

  const uploadFile = async (file: File) => {
    setUploading(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: 'Authentication error',
          description: 'You need to be logged in to upload files.',
          variant: 'destructive',
        });
        setUploading(false);
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('campaign_media')
        .upload(filePath, file);
        
      if (error) {
        console.error('Upload error:', error);
        throw error;
      }
      
      const publicUrl = supabase.storage
        .from('campaign_media')
        .getPublicUrl(filePath).data.publicUrl;
        
      return {
        url: publicUrl,
        path: filePath,
        type: file.type,
      };
    } catch (error: any) {
      toast({
        title: 'Upload error',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const collectVariations = (field: string): TextVariation[] => {
    const variations: TextVariation[] = [];
    
    const baseValue = form.watch(field as any);
    if (baseValue) {
      variations.push({ text: baseValue });
    }
    
    const variationsCount = 5;
    
    for (let i = 1; i < variationsCount; i++) {
      const variationKey = `${field}_variations.${i-1}.text`;
      const value = form.watch(variationKey as any);
      if (value) {
        variations.push({ text: value });
      }
    }
    
    return variations;
  };

  return {
    form,
    uploading,
    setUploading,
    fileInfo,
    setFileInfo,
    uploadFile,
    collectVariations,
  };
};
