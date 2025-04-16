import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { AdFormData, PLATFORM_CHARACTER_LIMITS } from '../types/campaign';
import { FileInfo } from './types';
import { AdMediaUploader } from './AdMediaUploader';
import { AdFormFields } from './AdFormFields';
import { cn } from '@/lib/utils';

interface Props {
  adsetId: string;
  campaignPlatform?: string;
}

interface WatchedFields {
  headline: string;
  description: string;
  main_text: string;
  keywords: string;
  brand_name: string;
}

function AdPreview({ fileInfo, watchedFields, platform, limits }: {
  fileInfo: FileInfo | null;
  watchedFields: WatchedFields;
  platform: string;
  limits: Record<string, number>;
}) {
  function platformName(platform: string): string {
    return platform || 'Unknown';
  }

  function formatFieldName(field: string): string {
    return field
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <div className="border rounded-lg p-4 bg-muted/20">
      <h3 className="font-semibold mb-4 text-lg">Ad Preview</h3>
      <div className="border rounded-md p-3 space-y-4 bg-white">
        <div className="relative h-40 bg-gray-100 rounded-md overflow-hidden">
          {fileInfo?.type === 'image' ? (
            <img
              src={fileInfo.url}
              alt="Ad preview"
              className="w-full h-full object-contain"
            />
          ) : fileInfo?.type === 'video' ? (
            <video
              src={fileInfo.url}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No media preview
            </div>
          )}
        </div>

        <div className="space-y-2">
          {watchedFields.headline && (
            <div className="text-base font-medium line-clamp-2">{watchedFields.headline}</div>
          )}

          {watchedFields.brand_name && (
            <div className="text-sm text-muted-foreground">{watchedFields.brand_name}</div>
          )}

          {watchedFields.main_text && (
            <div className="text-sm line-clamp-3">{watchedFields.main_text}</div>
          )}

          {watchedFields.description && (
            <div className="text-xs text-muted-foreground line-clamp-2">{watchedFields.description}</div>
          )}

          {watchedFields.keywords && (
            <div className="text-xs">
              <span className="text-muted-foreground">Keywords:</span> {watchedFields.keywords}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>Platform: {platformName(platform)} Ad</p>
        {limits && Object.keys(limits).length > 0 && (
          <ul className="mt-2 list-disc list-inside">
            {Object.entries(limits).map(([key, limit]) => (
              <li key={key}>{formatFieldName(key)}: max {limit} characters</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function CreateAdDialog({ adsetId, campaignPlatform }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
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
    },
  });

  const watchedFields: WatchedFields = {
    headline: form.watch('headline') || '',
    description: form.watch('description') || '',
    main_text: form.watch('main_text') || '',
    keywords: form.watch('keywords') || '',
    brand_name: form.watch('brand_name') || '',
  };

  const platform = campaignPlatform as keyof typeof PLATFORM_CHARACTER_LIMITS || 'Meta';
  const limits = PLATFORM_CHARACTER_LIMITS[platform] || {};
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    let adType = 'other';
    
    if (fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'png' || fileExt === 'gif') {
      adType = 'image';
    } else if (fileExt === 'mp4' || fileExt === 'webm' || fileExt === 'mov') {
      adType = 'video';
    }
    
    const previewUrl = URL.createObjectURL(file);
    setFileInfo({
      url: previewUrl,
      type: adType,
      file
    });
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    
    const fileExt = file.name.split('.').pop();
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('campaign_media')
      .upload(filePath, file);
      
    if (error) {
      setUploading(false);
      toast({
        title: 'Upload error',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('campaign_media')
      .getPublicUrl(filePath);
      
    setUploading(false);
    return {
      url: publicUrl,
      path: filePath,
      type: file.type,
    };
  };
  
  const onSubmit = async (data: AdFormData) => {
    if (!fileInfo) {
      toast({
        title: 'Missing file',
        description: 'Please upload an image or video for your ad.',
        variant: 'destructive',
      });
      return;
    }
    
    setUploading(true);
    const uploadedFile = await uploadFile(fileInfo.file);
    if (!uploadedFile) {
      setUploading(false);
      return;
    }
    
    const { error } = await supabase.from('ads').insert({
      ...data,
      ad_type: fileInfo.type,
      file_url: uploadedFile.url,
      file_type: fileInfo.file.type,
    });
    
    if (error) {
      toast({
        title: 'Error creating ad',
        description: error.message,
        variant: 'destructive',
      });
      setUploading(false);
      return;
    }

    toast({
      title: 'Ad created',
      description: 'Your ad has been created successfully.',
    });
    
    await queryClient.invalidateQueries({
      queryKey: ['ads', adsetId]
    });
    
    setUploading(false);
    setOpen(false);
    setStep(1);
    setFileInfo(null);
    form.reset();
  };

  const nextStep = () => {
    if (step === 1 && !fileInfo) {
      toast({
        title: 'Missing file',
        description: 'Please upload an image or video for your ad.',
        variant: 'destructive',
      });
      return;
    }
    setStep(2);
  };

  const resetDialog = () => {
    setStep(1);
    setFileInfo(null);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetDialog();
    }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Ad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Ad</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <div className="space-y-6">
                <AdMediaUploader
                  fileInfo={fileInfo}
                  onFileChange={handleFileChange}
                  onRemoveFile={() => setFileInfo(null)}
                />
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    disabled={!form.watch('name') || !fileInfo}
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdFormFields 
                  form={form}
                  platform={platform}
                  limits={limits}
                />
                
                <AdPreview
                  fileInfo={fileInfo}
                  watchedFields={watchedFields}
                  platform={platform}
                  limits={limits}
                />
                
                <div className="flex justify-between md:col-span-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? 'Creating...' : 'Create Ad'} 
                    {uploading ? null : <Check className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
