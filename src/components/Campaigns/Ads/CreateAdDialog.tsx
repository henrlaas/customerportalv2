
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
import { CreationMethodStep } from './Steps/CreationMethodStep';
import { AIPromptStep } from './Steps/AIPromptStep';
import { generateAdContent } from '@/services/aiContentService';

interface Props {
  adsetId: string;
  campaignPlatform?: string;
  disabled?: boolean;
}

export function CreateAdDialog({ adsetId, campaignPlatform, disabled = false }: Props) {
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

  const [isGenerating, setIsGenerating] = React.useState(false);

  const isSnapchat = validPlatform === 'Snapchat';
  const isTikTok = validPlatform === 'Tiktok';
  const isGoogle = validPlatform === 'Google';
  const creationMethod = form.watch('creation_method') || 'manual';

  // Update steps based on creation method and platform
  const getSteps = () => {
    const baseSteps = [{ label: 'Creation Method' }];

    if (creationMethod === 'ai') {
      baseSteps.push({ label: 'AI Prompt' });
    }

    if (isSnapchat) {
      baseSteps.push({ label: 'Media & Name' }, { label: 'Details & Preview' });
    } else if (isTikTok) {
      baseSteps.push({ label: 'Media & Name' }, { label: 'Details & Preview' });
    } else if (isGoogle) {
      baseSteps.push({ label: 'Basic Info' }, { label: 'Headlines' }, { label: 'Descriptions' }, { label: 'Keywords' }, { label: 'URL & Preview' });
    } else {
      baseSteps.push({ label: 'Basic Info' }, ...getStepsForPlatform(validPlatform).slice(1).map(step => ({ label: step.title })));
    }

    return baseSteps;
  };

  const steps = getSteps();

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
    
    const variation = Math.max(0, step - (creationMethod === 'ai' ? 3 : 2));
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
  
  // Helper function to submit the final ad
  const submitAd = async () => {
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
  };

  const handleAIGeneration = async () => {
    const prompt = form.watch('ai_prompt');
    const language = form.watch('ai_language') || 'english';

    if (!prompt) {
      toast({
        title: 'Missing prompt',
        description: 'Please provide a description for your ad.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const generatedContent = await generateAdContent({
        prompt,
        language,
        platform: validPlatform,
      });

      // Pre-fill form fields with generated content
      if (generatedContent.headlines?.length > 0) {
        form.setValue('headline', generatedContent.headlines[0]);
        generatedContent.headlines.forEach((headline, index) => {
          if (index > 0) {
            form.setValue(`headline_variations.${index - 1}.text`, headline);
          }
        });
      }

      if (generatedContent.descriptions?.length > 0) {
        form.setValue('description', generatedContent.descriptions[0]);
        generatedContent.descriptions.forEach((description, index) => {
          if (index > 0) {
            form.setValue(`description_variations.${index - 1}.text`, description);
          }
        });
      }

      if (generatedContent.main_texts?.length > 0) {
        form.setValue('main_text', generatedContent.main_texts[0]);
        generatedContent.main_texts.forEach((mainText, index) => {
          if (index > 0) {
            form.setValue(`main_text_variations.${index - 1}.text`, mainText);
          }
        });
      }

      if (generatedContent.keywords?.length > 0) {
        form.setValue('keywords', generatedContent.keywords[0]);
        generatedContent.keywords.forEach((keywords, index) => {
          if (index > 0) {
            form.setValue(`keywords_variations.${index - 1}.text`, keywords);
          }
        });
      }

      if (generatedContent.brand_name) {
        form.setValue('brand_name', generatedContent.brand_name);
      }

      toast({
        title: 'Content generated!',
        description: 'AI has pre-filled your ad content. You can edit it before creating the ad.',
      });

      setStep(step + 1);
    } catch (error: any) {
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const validateCurrentStep = () => {
    // Step 0: Creation method - always valid (radio button has default)
    if (step === 0) return true;

    // Step 1: AI prompt (only if AI method selected)
    if (step === 1 && creationMethod === 'ai') {
      const prompt = form.watch('ai_prompt');
      if (!prompt?.trim()) {
        toast({
          title: 'Missing prompt',
          description: 'Please provide a description for your ad.',
          variant: 'destructive',
        });
        return false;
      }
      return true;
    }

    // Basic info step validation
    const basicInfoStepIndex = creationMethod === 'ai' ? 2 : 1;
    if (step === basicInfoStepIndex) {
      const name = form.watch('name');
      if (!name?.trim()) {
        toast({
          title: 'Missing information',
          description: 'Please provide an ad name.',
          variant: 'destructive',
        });
        return false;
      }

      // Check media upload requirement for non-Google platforms
      if (requiresMediaUpload(validPlatform) && !fileInfo) {
        toast({
          title: 'Missing file',
          description: 'Please upload an image or video for your ad.',
          variant: 'destructive',
        });
        return false;
      }
      return true;
    }

    // Platform-specific validation for remaining steps
    if (isGoogle || isSnapchat || isTikTok) {
      return true; // These have their own validation
    }

    // Default platform validation
    return validateStepFn(step - basicInfoStepIndex - 1, form, fileInfo, validPlatform, requiresMediaUpload, toast);
  };

  const isLastStep = step === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetDialog(setFileInfo, form);
    }}>
      <DialogTrigger asChild>
        <Button size="sm" className="transition-all hover:scale-105 hover:shadow-md" disabled={disabled}>
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
              {/* Step 0: Creation Method */}
              {step === 0 && (
                <CreationMethodStep
                  form={form}
                  onNext={() => setStep(step + 1)}
                />
              )}

              {/* Step 1: AI Prompt (only if AI method selected) */}
              {step === 1 && creationMethod === 'ai' && (
                <AIPromptStep
                  form={form}
                  onGenerate={handleAIGeneration}
                  isGenerating={isGenerating}
                />
              )}

              {/* Basic Info / Media & Name Step */}
              {step === (creationMethod === 'ai' ? 2 : 1) && (
                <>
                  {isSnapchat ? (
                    <SnapchatAdSteps
                      step={0}
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
                      step={0}
                      setStep={setStep}
                      fileInfo={fileInfo}
                      setFileInfo={setFileInfo}
                      form={form}
                      toast={toast}
                      validPlatform={validPlatform}
                      uploading={uploading}
                    />
                  ) : isGoogle ? (
                    <DefaultPlatformAdSteps
                      steps={[steps[creationMethod === 'ai' ? 2 : 1]]}
                      step={0}
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
                  ) : (
                    <DefaultPlatformAdSteps
                      steps={[steps[creationMethod === 'ai' ? 2 : 1]]}
                      step={0}
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
                </>
              )}

              {/* Remaining platform-specific steps */}
              {step > (creationMethod === 'ai' ? 2 : 1) && (
                <>
                  {isSnapchat ? (
                    <SnapchatAdSteps
                      step={1}
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
                      step={1}
                      setStep={setStep}
                      fileInfo={fileInfo}
                      setFileInfo={setFileInfo}
                      form={form}
                      toast={toast}
                      validPlatform={validPlatform}
                      uploading={uploading}
                    />
                  ) : isGoogle ? (
                    <GoogleAdSteps
                      step={step - (creationMethod === 'ai' ? 3 : 2)}
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
                      steps={getStepsForPlatform(validPlatform).slice(1)}
                      step={step - (creationMethod === 'ai' ? 3 : 2)}
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
                </>
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
                onClick={() => {
                  if (isLastStep) {
                    submitAd();
                  } else if (step === 1 && creationMethod === 'ai') {
                    // AI prompt step - handled by handleAIGeneration
                    return;
                  } else {
                    // Validate current step before proceeding
                    if (validateCurrentStep()) {
                      setStep(step + 1);
                    }
                  }
                }}
                className="bg-primary hover:bg-primary/90"
                disabled={isGenerating || uploading}
              >
                {isLastStep ? "Create Ad" : "Next"}
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
