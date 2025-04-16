
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Check } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { AdFormData, PLATFORM_CHARACTER_LIMITS, Platform } from '../types/campaign';
import { FileInfo, WatchedFields } from './types';
import { AdMediaUploaderStep } from './AdMediaUploaderStep';
import { AdFormFields } from './AdFormFields';
import { AdPreview } from './AdPreview';
import { AdProgressStepper } from './AdProgressStepper';

interface Props {
  adsetId: string;
  campaignPlatform?: string;
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

  const ensureStorageBucket = async () => {
    try {
      // Check if the campaign_media bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'campaign_media');
      
      if (!bucketExists) {
        // Create the bucket if it doesn't exist
        const { error } = await supabase.storage.createBucket('campaign_media', {
          public: true,
          fileSizeLimit: 50 * 1024 * 1024, // 50MB
        });
        
        if (error) {
          console.error('Error creating bucket:', error);
          throw new Error('Failed to create storage bucket');
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error ensuring storage bucket exists:', error);
      return false;
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    
    try {
      // Ensure bucket exists
      const bucketReady = await ensureStorageBucket();
      
      if (!bucketReady) {
        toast({
          title: 'Storage error',
          description: 'Could not access storage bucket',
          variant: 'destructive',
        });
        setUploading(false);
        return null;
      }
      
      const fileExt = file.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('campaign_media')
        .upload(filePath, file);
        
      if (error) {
        console.error('Upload error:', error);
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('campaign_media')
        .getPublicUrl(filePath);
        
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
    resetDialog();
  };

  const nextStep = () => {
    if (step === 1 && (!fileInfo || !form.watch('name'))) {
      toast({
        title: 'Missing information',
        description: 'Please provide an ad name and upload a media file.',
        variant: 'destructive',
      });
      return;
    }
    setStep(2);
  };

  const previousStep = () => {
    setStep(1);
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
        
        <AdProgressStepper currentStep={step} totalSteps={2} />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <AdMediaUploaderStep
                fileInfo={fileInfo}
                onFileChange={handleFileChange}
                onRemoveFile={() => setFileInfo(null)}
                form={form}
                onNextStep={nextStep}
              />
            )}
            
            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdFormFields 
                  form={form}
                  platform={platform as Platform}
                  limits={limits}
                />
                
                <AdPreview
                  fileInfo={fileInfo}
                  watchedFields={watchedFields}
                  platform={platform}
                  limits={limits}
                />
                
                <div className="flex justify-between md:col-span-2">
                  <Button type="button" variant="outline" onClick={previousStep}>
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
