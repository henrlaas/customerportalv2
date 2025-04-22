import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { AdFormData, PLATFORM_CHARACTER_LIMITS, Platform } from '../types/campaign';
import { requiresMediaUpload, getStepsForPlatform } from './types/variations';
import { motion, AnimatePresence } from 'framer-motion';
import { AdProgressStepper } from './AdProgressStepper';
import { useAdForm } from './hooks/useAdForm';
import { useAdDialog } from './hooks/useAdDialog';
import { SnapchatAdSteps } from './Steps/SnapchatAdSteps';
import { TiktokAdSteps } from './Steps/TiktokAdSteps';
import { GoogleAdSteps } from './Steps/GoogleAdSteps';
import { DefaultPlatformAdSteps } from './Steps/DefaultPlatformAdSteps';
import { FileInfo } from './types';
import { createElement } from 'react';

interface Props {
  adsetId: string;
  campaignPlatform?: string;
}

export function CreateAdDialog({ adsetId, campaignPlatform }: Props) {
  const validPlatform = (campaignPlatform as Platform) || 'Meta';
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    form,
    uploading,
    setUploading,
    fileInfo,
    setFileInfo,
    uploadFile,
    collectVariations,
  } = useAdForm(adsetId, campaignPlatform);

  const {
    open,
    setOpen,
    step,
    setStep,
    resetDialog,
    validateStep: validateStepFn,
  } = useAdDialog();

  const isSnapchat = validPlatform === 'Snapchat';
  const isTikTok = validPlatform === 'Tiktok';

  const steps = isSnapchat
    ? [{ label: 'Media & Name' }, { label: 'Details & Preview' }]
    : isTikTok
      ? [{ label: 'Media & Name' }, { label: 'Details & Preview' }]
      : getStepsForPlatform(validPlatform);

  const getWatchedFieldsForCurrentVariation = () => {
    if (isSnapchat) {
      return {
        headline: form.watch('headline') || '',
        description: '', 
        main_text: '',   
        keywords: '',
        brand_name: form.watch('brand_name') || '',
        cta_button: '',
        url: form.watch('url') || '',
      };
    }
    
    if (isTikTok) {
      return {
        headline: form.watch('headline') || '',
        description: '', 
        main_text: '',
        keywords: '',
        brand_name: '',
        cta_button: '',
        url: form.watch('url') || '',
      };
    }
    
    const variation = Math.max(0, step - 2);
    return {
      headline: form.watch(`headline_variations.${variation}.text`) || form.watch('headline') || '',
      description: form.watch(`description_variations.${variation}.text`) || form.watch('description') || '',
      main_text: form.watch(`main_text_variations.${variation}.text`) || form.watch('main_text') || '',
      keywords: form.watch(`keywords_variations.${variation}.text`) || form.watch('keywords') || '',
      brand_name: form.watch('brand_name') || '',
      cta_button: form.watch('cta_button') || '',
      url: form.watch('url') || '',
    };
  };

  const watchedFields = getWatchedFieldsForCurrentVariation();
  const limits = PLATFORM_CHARACTER_LIMITS[validPlatform] || {};

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetDialog(setFileInfo, form);
    }}>
      <DialogTrigger asChild>
        <Button size="sm" className="transition-all hover:scale-105 hover:shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          Create Ad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-gradient-to-br from-background to-muted/30 backdrop-blur-sm border-primary/10">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Create New Ad
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6">
          <AdProgressStepper currentStep={step + 1} totalSteps={steps.length} />
        </div>
        
        <Form {...form}>
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {isSnapchat ? (
                <SnapchatAdSteps
                  step={step}
                  setStep={setStep}
                  fileInfo={fileInfo}
                  setFileInfo={setFileInfo}
                  form={form}
                  toast={toast}
                  validPlatform={validPlatform}
                  uploading={uploading}
                />
              ) : isTikTok ? (
                <TiktokAdSteps
                  step={step}
                  setStep={setStep}
                  fileInfo={fileInfo}
                  setFileInfo={setFileInfo}
                  form={form}
                  toast={toast}
                  validPlatform={validPlatform}
                  uploading={uploading}
                />
              ) : validPlatform === 'Google' ? (
                <GoogleAdSteps
                  step={step}
                  setStep={setStep}
                  form={form}
                  fileInfo={fileInfo}
                  toast={toast}
                  validateStepFn={validateStepFn}
                  setFileInfo={setFileInfo}
                  uploading={uploading}
                  limits={limits}
                  watchedFields={watchedFields}
                />
              ) : (
                <DefaultPlatformAdSteps
                  steps={steps}
                  step={step}
                  setStep={setStep}
                  form={form}
                  fileInfo={fileInfo}
                  setFileInfo={setFileInfo}
                  validateStepFn={validateStepFn}
                  validPlatform={validPlatform}
                  limits={limits}
                  toast={toast}
                  getWatchedFieldsForCurrentVariation={getWatchedFieldsForCurrentVariation}
                />
              )}
            </AnimatePresence>
            <div className="flex justify-between p-6 pt-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => step > 0 && setStep(step - 1)}
                className="transition-all duration-200 hover:bg-primary/10"
                disabled={step === 0}
              >
                Back
              </Button>
              <Button 
                type="button" 
                onClick={async () => {
                  if (uploading) return;
                  const data = form.getValues();
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
                    resetDialog(setFileInfo, form);
                  } catch (error: any) {
                    toast({
                      title: 'Error creating ad',
                      description: error.message,
                      variant: 'destructive',
                    });
                  } finally {
                    setUploading(false);
                  }
                }}
                className="bg-primary hover:bg-primary/90"
              >
                Create Ad
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
