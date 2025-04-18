
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
import { AdPreview } from './AdPreview';
import { TextVariation, getStepsForPlatform, requiresMediaUpload } from './types/variations';
import { AdVariationStepper } from './AdVariationStepper';
import { AdVariationFields } from './AdVariationFields';

interface Props {
  adsetId: string;
  campaignPlatform?: string;
}

export function CreateAdDialog({ adsetId, campaignPlatform }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Ensure platform is a valid Platform type, or default to 'Meta'
  const validPlatform = (campaignPlatform as Platform) || 'Meta';
  const steps = getStepsForPlatform(validPlatform);
  
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
      url: null,
    },
  });

  const watchedFields: WatchedFields = {
    headline: form.watch('headline') || '',
    description: form.watch('description') || '',
    main_text: form.watch('main_text') || '',
    keywords: form.watch('keywords') || '',
    brand_name: form.watch('brand_name') || '',
    cta_button: form.watch('cta_button') || '',
    url: form.watch('url') || '',
  };

  const limits = PLATFORM_CHARACTER_LIMITS[validPlatform] || {};
  
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
    
    try {
      // Get authenticated session
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
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from('campaign_media')
        .upload(filePath, file);
        
      if (error) {
        console.error('Upload error:', error);
        throw error;
      }
      
      // Get public URL
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

  // Collect all variations for a specific field
  const collectVariations = (field: string): TextVariation[] => {
    const variations: TextVariation[] = [];
    
    // Add the base field as the first variation
    const baseValue = form.watch(field as keyof AdFormData);
    if (baseValue) {
      variations.push({ text: baseValue });
    }
    
    // Add other variations if they exist
    for (let i = 1; i < steps.length; i++) {
      const variationKey = `${field}_variations.${i-1}.text`;
      const value = form.watch(variationKey as keyof AdFormData);
      if (value) {
        variations.push({ text: value });
      }
    }
    
    return variations;
  };
  
  const onSubmit = async (data: AdFormData) => {
    // For Google ads, we don't need a file upload
    if (requiresMediaUpload(validPlatform) && !fileInfo) {
      toast({
        title: 'Missing file',
        description: 'Please upload an image or video for your ad.',
        variant: 'destructive',
      });
      return;
    }
    
    setUploading(true);
    
    // Upload file if needed
    let uploadedFile = null;
    if (fileInfo) {
      uploadedFile = await uploadFile(fileInfo.file);
      if (!uploadedFile && requiresMediaUpload(validPlatform)) {
        setUploading(false);
        return;
      }
    }
    
    // Collect all variations for each field type
    const headlineVariations = collectVariations('headline');
    const descriptionVariations = collectVariations('description');
    const mainTextVariations = collectVariations('main_text');
    const keywordsVariations = collectVariations('keywords');
    
    try {
      // Insert the ad with all variations
      const { error } = await supabase.from('ads').insert({
        ...data,
        ad_type: fileInfo?.type || 'text',
        file_url: uploadedFile?.url || null,
        file_type: fileInfo?.file.type || null,
        headline_variations: JSON.stringify(headlineVariations.slice(1)), // Start from index 1 since the first one is the base field
        description_variations: JSON.stringify(descriptionVariations.slice(1)),
        main_text_variations: JSON.stringify(mainTextVariations.slice(1)),
        keywords_variations: JSON.stringify(keywordsVariations.slice(1)),
        url: data.url || null,
      });
      
      if (error) {
        throw error;
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

  const validateStep = () => {
    if (step === 0) {
      // Check if name is provided
      const name = form.watch('name');
      if (!name) {
        toast({
          title: 'Missing information',
          description: 'Please provide an ad name.',
          variant: 'destructive',
        });
        return false;
      }
      
      // For platforms that require media, check if it's uploaded
      if (requiresMediaUpload(validPlatform) && step === 0 && !fileInfo) {
        toast({
          title: 'Missing file',
          description: 'Please upload an image or video for your ad.',
          variant: 'destructive',
        });
        return false;
      }
    }
    
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const previousStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const resetDialog = () => {
    setStep(0);
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Ad</DialogTitle>
        </DialogHeader>
        
        <AdVariationStepper 
          platform={validPlatform}
          currentStep={step} 
          steps={steps}
          onStepChange={setStep}
        />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 0 && (
              <AdMediaUploaderStep
                fileInfo={fileInfo}
                onFileChange={handleFileChange}
                onRemoveFile={() => setFileInfo(null)}
                form={form}
                onNextStep={nextStep}
                hideFileUpload={!requiresMediaUpload(validPlatform)}
              />
            )}
            
            {step > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdVariationFields 
                  form={form}
                  platform={validPlatform}
                  variation={step}
                  fields={steps[step].fields || []}
                  showBasicFields={steps[step].showBasicFields}
                />
                
                {/* Only show preview for certain platforms and steps */}
                {((validPlatform === 'Meta' || validPlatform === 'LinkedIn') || 
                  (validPlatform === 'Google' && step === steps.length - 1) ||
                  (validPlatform === 'Snapchat' && step > 0) ||
                  (validPlatform === 'Tiktok' && step > 0)) && (
                  <AdPreview
                    fileInfo={fileInfo}
                    watchedFields={watchedFields}
                    platform={validPlatform}
                    limits={limits}
                  />
                )}
                
                <div className="flex justify-between md:col-span-2">
                  <Button type="button" variant="outline" onClick={previousStep}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  
                  {step === steps.length - 1 ? (
                    <Button type="submit" disabled={uploading}>
                      {uploading ? 'Creating...' : 'Create Ad'} 
                      {uploading ? null : <Check className="ml-2 h-4 w-4" />}
                    </Button>
                  ) : (
                    <Button type="button" onClick={nextStep}>
                      Next
                    </Button>
                  )}
                </div>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
