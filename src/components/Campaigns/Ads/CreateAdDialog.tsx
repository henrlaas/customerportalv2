import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Check, Camera, FileText, Globe, Link } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { AdFormData, PLATFORM_CHARACTER_LIMITS, Platform } from '../types/campaign';
import { requiresMediaUpload, getStepsForPlatform } from './types/variations';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AdProgressStepper } from './AdProgressStepper';
import '../animations.css';
import { BasicInfoStep } from './Steps/BasicInfoStep';
import { UrlAndCtaStep } from './Steps/UrlAndCtaStep';
import { VariationStep } from './Steps/VariationStep';
import { ConfirmationStep } from './Steps/ConfirmationStep';
import { useAdForm } from './hooks/useAdForm';
import { useAdDialog } from './hooks/useAdDialog';
import { AdDialogPreview } from './components/AdDialogPreview';
import { getStepIcon } from './utils/stepUtils';
import { FileInfo, WatchedFields } from './types';
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

  // Adaptable steps logic: get platform-specific steps
  const steps = getStepsForPlatform(validPlatform);

  // Helper: For Google steps, collect preview correctly for last step
  const getWatchedFieldsForCurrentVariation = (): WatchedFields => {
    if (validPlatform === 'Google') {
      if (step === 0) {
        return {
          headline: '',
          description: '',
          main_text: '',
          keywords: '',
          brand_name: '',
          cta_button: '',
          url: '',
        };
      }
      if (step === 1) {
        // Headline step, no preview
        return {
          headline: '',
          description: '',
          main_text: '',
          keywords: '',
          brand_name: '',
          cta_button: '',
          url: '',
        };
      }
      if (step === 2) {
        // Description step, no preview
        return {
          headline: '',
          description: '',
          main_text: '',
          keywords: '',
          brand_name: '',
          cta_button: '',
          url: '',
        };
      }
      if (step === 3) {
        // Keywords step, no preview
        return {
          headline: '',
          description: '',
          main_text: '',
          keywords: '',
          brand_name: '',
          cta_button: '',
          url: '',
        };
      }
      if (step === 4) {
        // URL step, show preview with first headline and description
        const headline0 = form.watch('headline_variations.0.text') || '';
        const description0 = form.watch('description_variations.0.text') || '';
        return {
          headline: headline0,
          description: description0,
          main_text: '',
          keywords: form.watch('keywords_variations.0.text') || '',
          brand_name: '',
          cta_button: '',
          url: form.watch('url') || '',
        };
      }
      // fallback
      return {
        headline: '',
        description: '',
        main_text: '',
        keywords: '',
        brand_name: '',
        cta_button: '',
        url: '',
      };
    }

    // Default: old behavior for other platforms (Meta, LinkedIn, etc)
    // keep previous logic for Meta/LinkedIn
    if (step === 0 || step === 1 || step === steps.length - 1) {
      return {
        headline: form.watch('headline') || '',
        description: form.watch('description') || '',
        main_text: form.watch('main_text') || '',
        keywords: form.watch('keywords') || '',
        brand_name: form.watch('brand_name') || '',
        cta_button: form.watch('cta_button') || '',
        url: form.watch('url') || '',
      };
    }
    
    const variationIndex = step - 2;
    if (variationIndex === 0) {
      return {
        headline: form.watch('headline') || '',
        description: form.watch('description') || '',
        main_text: form.watch('main_text') || '',
        keywords: form.watch('keywords') || '',
        brand_name: form.watch('brand_name') || '',
        cta_button: form.watch('cta_button') || '',
        url: form.watch('url') || '',
      };
    }
    return {
      headline: form.watch(`headline_variations.${variationIndex-1}.text`) || form.watch('headline') || '',
      description: form.watch(`description_variations.${variationIndex-1}.text`) || form.watch('description') || '',
      main_text: form.watch(`main_text_variations.${variationIndex-1}.text`) || form.watch('main_text') || '',
      keywords: form.watch('keywords') || '',
      brand_name: form.watch('brand_name') || '',
      cta_button: form.watch('cta_button') || '',
      url: form.watch('url') || '',
    };
  };

  const watchedFields = getWatchedFieldsForCurrentVariation();

  // Ensure Supabase logic saves variations as before (no change needed here)
  const limits = PLATFORM_CHARACTER_LIMITS[validPlatform] || {};
  
  const renderStepIcon = (stepIndex: number) => {
    const iconData = getStepIcon(stepIndex, { Camera, Globe, FileText });
    if (iconData && iconData.type) {
      return createElement(iconData.type, iconData.props);
    }
    return null;
  };

  // Custom Google ads submit handler to flatten data as needed
  const handleManualSubmit = async () => {
    if (uploading) return;
    const data = form.getValues();

    // > No file upload for Google. Check file only for non-Google.
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

    // For all platforms, always send _variations as JSON
    const headlineVariations = collectVariations('headline');
    const descriptionVariations = collectVariations('description');
    const mainTextVariations = collectVariations('main_text');
    const keywordsVariations = collectVariations('keywords');

    try {
      const { error } = await supabase.from('ads').insert({
        ...data,
        ad_type: fileInfo?.type || (validPlatform === 'Google' ? 'text' : 'text'),
        file_url: uploadedFile?.url || null,
        file_type: fileInfo?.file.type || (validPlatform === 'Google' ? null : null),
        headline_variations: JSON.stringify(headlineVariations),
        description_variations: JSON.stringify(descriptionVariations),
        main_text_variations: JSON.stringify(mainTextVariations),
        keywords_variations: JSON.stringify(keywordsVariations),
        url: data.url || null,
      });
      
      if (error) throw error;

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

  // ========== STEP RENDERING ==========

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
            {/* --- GOOGLE ADS Special Flow --- */}
            {validPlatform === 'Google' && (
              <>
                {/* Step 0 = Ad Name (no file upload) */}
                {step === 0 && (
                  <motion.div
                    key="google-step-0"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    <BasicInfoStep
                      fileInfo={null}
                      onFileChange={() => {}}
                      onRemoveFile={() => {}}
                      form={form}
                      onNextStep={() => {
                        if (form.watch('name')?.trim()) {
                          setStep(step + 1)
                        } else {
                          toast({
                            title: 'Missing information',
                            description: 'Please provide an ad name.',
                            variant: 'destructive',
                          });
                        }
                      }}
                      hideFileUpload={true}
                    />
                  </motion.div>
                )}

                {/* Step 1 = 10 headlines */}
                {step === 1 && (
                  <motion.div
                    key="google-step-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    <h2 className="text-lg font-bold mb-4">Headlines</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(10)].map((_, i) => (
                        <div key={i}>
                          <label className="block text-sm mb-1" htmlFor={`headline_variations.${i}.text`}>
                            Headline {i + 1} <span className="text-xs text-muted-foreground">({(form.watch(`headline_variations.${i}.text`) || '').length}/30)</span>
                          </label>
                          <input
                            id={`headline_variations.${i}.text`}
                            type="text"
                            maxLength={30}
                            className="w-full border rounded px-3 py-2"
                            {...form.register(`headline_variations.${i}.text`)}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2 = 4 descriptions */}
                {step === 2 && (
                  <motion.div
                    key="google-step-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    <h2 className="text-lg font-bold mb-4">Descriptions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i}>
                          <label className="block text-sm mb-1" htmlFor={`description_variations.${i}.text`}>
                            Description {i + 1} <span className="text-xs text-muted-foreground">({(form.watch(`description_variations.${i}.text`) || '').length}/90)</span>
                          </label>
                          <input
                            id={`description_variations.${i}.text`}
                            type="text"
                            maxLength={90}
                            className="w-full border rounded px-3 py-2"
                            {...form.register(`description_variations.${i}.text`)}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 3 = 5 keywords */}
                {step === 3 && (
                  <motion.div
                    key="google-step-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    <h2 className="text-lg font-bold mb-4">Keywords</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i}>
                          <label className="block text-sm mb-1" htmlFor={`keywords_variations.${i}.text`}>
                            Keywords Set {i + 1} <span className="text-xs text-muted-foreground">({(form.watch(`keywords_variations.${i}.text`) || '').length}/80)</span>
                          </label>
                          <input
                            id={`keywords_variations.${i}.text`}
                            type="text"
                            maxLength={80}
                            className="w-full border rounded px-3 py-2"
                            {...form.register(`keywords_variations.${i}.text`)}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 4 = URL + preview */}
                {step === 4 && (
                  <motion.div
                    key="google-step-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6"
                  >
                    <div>
                      <label className="block text-sm mb-1" htmlFor="url">
                        URL
                      </label>
                      <input
                        id="url"
                        type="text"
                        className="w-full border rounded px-3 py-2 mb-6"
                        {...form.register('url')}
                      />
                    </div>
                    {/* Ad live preview */}
                    <AdDialogPreview
                      fileInfo={null}
                      watchedFields={watchedFields}
                      platform={validPlatform}
                      limits={limits}
                      variation={0}
                    />
                  </motion.div>
                )}
              </>
            )}

            {/* --- OTHER PLATFORMS (META, LINKEDIN, etc) --- */}
            {validPlatform !== 'Google' && (
              <>
                {steps.map((platformStep, idx) => {
                  // Basic Info
                  if (step === idx && idx === 0) {
                    return (
                      <motion.div
                        key={`step-${idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6"
                      >
                        <BasicInfoStep
                          fileInfo={fileInfo}
                          onFileChange={handleFileChange}
                          onRemoveFile={() => setFileInfo(null)}
                          form={form}
                          onNextStep={() => {
                            if (validateStepFn(step, form, fileInfo, validPlatform, requiresMediaUpload, toast)) {
                              setStep(step + 1);
                            }
                          }}
                          hideFileUpload={!requiresMediaUpload(validPlatform)}
                        />
                      </motion.div>
                    );
                  }
                  // Platform-specific steps (skip preview for some steps)
                  // Show preview only for chosen platforms/steps
                  if (
                    step === idx &&
                    (
                      (validPlatform === 'Meta' || validPlatform === 'LinkedIn') ?
                        // Preview for steps 2-6 (variation steps)
                        idx >= 2 && idx <= 6 :
                        true
                    )
                  ) {
                    return (
                      <motion.div
                        key={`step-${idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={
                          idx >= 2 && idx <= 6
                            ? "grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6"
                            : "px-6 pb-6"
                        }
                      >
                        <div className="space-y-6">
                          <VariationStep
                            form={form}
                            platform={validPlatform}
                            variation={idx - 2}
                            fields={platformStep.fields || []}
                            showBasicFields={platformStep.showBasicFields}
                          />
                        </div>
                        {/* Preview only for variation steps */}
                        {idx >= 2 && idx <= 6 && (
                          <AdDialogPreview
                            fileInfo={fileInfo}
                            watchedFields={getWatchedFieldsForCurrentVariation()}
                            platform={validPlatform}
                            limits={limits}
                            variation={idx - 2}
                          />
                        )}
                      </motion.div>
                    );
                  }
                  // URL & CTA step for Meta/LinkedIn
                  if (step === idx && idx === 1 && (validPlatform === 'Meta' || validPlatform === 'LinkedIn')) {
                    return (
                      <motion.div
                        key={`step-${idx}-urlcta`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6"
                      >
                        <UrlAndCtaStep form={form} />
                      </motion.div>
                    );
                  }
                  // Confirmation Step
                  if (step === idx && idx === steps.length - 1) {
                    return (
                      <motion.div
                        key="step-confirmation"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6"
                      >
                        <ConfirmationStep form={form} platform={validPlatform} />
                      </motion.div>
                    );
                  }
                  return null;
                })}
              </>
            )}
            </AnimatePresence>

            {/* --- FOOTER BUTTONS --- */}
            <div className="flex justify-between p-6 pt-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => step > 0 && setStep(step - 1)}
                className={cn(
                  "transition-all duration-200 hover:bg-primary/10",
                  step === 0 && "opacity-50 cursor-not-allowed"
                )}
                disabled={step === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              {/* Google platform uses 5 steps (indices 0-4), so confirm on last step */}
              {(validPlatform === 'Google' ? (step === 4) : (step === steps.length - 1)) ? (
                <Button 
                  type="button"
                  onClick={handleManualSubmit}
                  disabled={uploading}
                  className="transition-all duration-200 hover:bg-primary-foreground/90 hover:text-primary hover:scale-105 shadow-sm hover:shadow-md"
                >
                  {uploading ? 'Creating...' : 'Create Ad'} 
                  {!uploading && <Check className="ml-2 h-4 w-4" />}
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={() => {
                    // Google: simple step validation
                    if (validPlatform === 'Google') {
                      if (step === 0 && !form.watch('name')?.trim()) {
                        toast({
                          title: 'Missing information',
                          description: 'Please provide an ad name.',
                          variant: 'destructive',
                        }); return;
                      }
                    }
                    // All others: reuse validateStepFn
                    else if (!validateStepFn(step, form, fileInfo, validPlatform, requiresMediaUpload, toast)) {
                      return;
                    }
                    setStep(step + 1);
                  }}
                  className="transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// NOTE: This file is now quite long (over 400 lines). You may wish to refactor into smaller component files for easier maintainability.
