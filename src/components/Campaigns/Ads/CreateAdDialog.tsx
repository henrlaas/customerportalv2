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

  // Custom logic for Snapchat: force 2 steps
  const isSnapchat = validPlatform === 'Snapchat';
  // Custom logic for TikTok: force 2 steps
  const isTikTok = validPlatform === 'TikTok';

  const steps = isSnapchat
    ? [{ label: 'Media & Name' }, { label: 'Details & Preview' }]
    : isTikTok
      ? [{ label: 'Media & Name' }, { label: 'Details & Preview' }]
      : getStepsForPlatform(validPlatform);

  // Helper for preview fields specific to Snapchat
  const getWatchedFieldsForSnapchat = () => ({
    headline: form.watch('headline') || '',
    description: '', // Snapchat ads might not use description field
    main_text: '',   // Not used for Snapchat
    keywords: '',
    brand_name: form.watch('brand_name') || '',
    cta_button: '',
    url: form.watch('url') || '',
  });

  // Helper for preview fields specific to TikTok
  const getWatchedFieldsForTikTok = () => ({
    headline: form.watch('headline') || '',
    description: '', // Only headline and URL for TikTok
    main_text: '',
    keywords: '',
    brand_name: '',
    cta_button: '',
    url: form.watch('url') || '',
  });

  // Helper for preview fields for current variation
  const getWatchedFieldsForCurrentVariation = () => {
    if (isSnapchat) {
      return getWatchedFieldsForSnapchat();
    }
    if (isTikTok) {
      return getWatchedFieldsForTikTok();
    }
    // For other platforms, look at the current variation (step - 2 is the variation index)
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
      // Define the base ad data that is common for all platforms
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
      
      // Set platform-specific properties
      if (validPlatform === 'Google') {
        // For Google ads (text only)
        const { error } = await supabase.from('ads').insert({
          ...adData,
          ad_type: 'text',
          file_url: null,
          file_type: null
        });
        
        if (error) throw error;
      } else if (validPlatform === 'Snapchat') {
        // For Snapchat ads
        const { error } = await supabase.from('ads').insert({
          ...adData,
          ad_type: fileInfo?.type || 'text',
          file_url: uploadedFile?.url || null,
          file_type: fileInfo?.file.type || null
        });
        
        if (error) throw error;
      } else {
        // For other platforms that require media
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

            {/* ------------- SNAPCHAT FLOW ------------- */}
            {isSnapchat && (
              <>
                {/* STEP 0: Ad name + image/video */}
                {step === 0 && (
                  <motion.div
                    key="snapchat-step-0"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    {/* Ad name */}
                    <div className="mb-6">
                      <label htmlFor="name" className="block text-sm mb-1 font-medium">Ad Name</label>
                      <input
                        id="name"
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        {...form.register('name', { required: true })}
                        maxLength={80}
                      />
                    </div>
                    {/* Media upload */}
                    <div className="mb-6">
                      <label className="block text-sm mb-1 font-medium">Image or Video</label>
                      {!fileInfo ? (
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={async (e) => {
                            if (!e.target.files || e.target.files.length === 0) return;
                            const file = e.target.files[0];
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
                          }}
                          className="border border-dashed border-primary px-4 py-2 rounded w-full"
                        />
                      ) : (
                        <div className="flex items-center space-x-4">
                          {fileInfo.type === 'image' ? (
                            <img src={fileInfo.url} alt="Ad media preview" className="h-20 rounded" />
                          ) : (
                            <video src={fileInfo.url} controls className="h-20 rounded" />
                          )}
                          <Button type="button" variant="destructive" size="sm" onClick={() => setFileInfo(null)}>
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={() => {
                          const adName = form.watch('name')?.trim();
                          if (!adName) {
                            toast({
                              title: 'Missing information',
                              description: 'Please provide an ad name.',
                              variant: 'destructive',
                            });
                            return;
                          }
                          if (!fileInfo) {
                            toast({
                              title: 'Missing file',
                              description: 'Please upload an image or video for your ad.',
                              variant: 'destructive',
                            });
                            return;
                          }
                          setStep(1);
                        }}>
                        Next
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 1: Brand, Headline, URL + Preview */}
                {step === 1 && (
                  <motion.div
                    key="snapchat-step-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6"
                  >
                    <div className="space-y-6">
                      {/* Brand name */}
                      <div>
                        <label htmlFor="brand_name" className="block text-sm mb-1 font-medium">Brand Name</label>
                        <input
                          id="brand_name"
                          type="text"
                          maxLength={50}
                          className="w-full border rounded px-3 py-2"
                          {...form.register('brand_name')}
                        />
                      </div>
                      {/* Headline */}
                      <div>
                        <label htmlFor="headline" className="block text-sm mb-1 font-medium">Headline</label>
                        <input
                          id="headline"
                          type="text"
                          maxLength={60}
                          className="w-full border rounded px-3 py-2"
                          {...form.register('headline')}
                        />
                      </div>
                      {/* URL */}
                      <div>
                        <label htmlFor="url" className="block text-sm mb-1 font-medium">URL</label>
                        <input
                          id="url"
                          type="text"
                          className="w-full border rounded px-3 py-2"
                          {...form.register('url')}
                        />
                      </div>
                    </div>
                    <div>
                      <AdDialogPreview
                        fileInfo={fileInfo}
                        watchedFields={getWatchedFieldsForSnapchat()}
                        platform={validPlatform}
                        limits={{ headline: 60, brand_name: 50 }}
                        variation={0}
                      />
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* ------------- TIKTOK FLOW ------------- */}
            {isTikTok && (
              <>
                {/* STEP 0: Ad name + image/video */}
                {step === 0 && (
                  <motion.div
                    key="tiktok-step-0"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    {/* Ad name */}
                    <div className="mb-6">
                      <label htmlFor="name" className="block text-sm mb-1 font-medium">Ad Name</label>
                      <input
                        id="name"
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        {...form.register('name', { required: true })}
                        maxLength={80}
                      />
                    </div>
                    {/* Media upload */}
                    <div className="mb-6">
                      <label className="block text-sm mb-1 font-medium">Image or Video</label>
                      {!fileInfo ? (
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={async (e) => {
                            if (!e.target.files || e.target.files.length === 0) return;
                            const file = e.target.files[0];
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
                          }}
                          className="border border-dashed border-primary px-4 py-2 rounded w-full"
                        />
                      ) : (
                        <div className="flex items-center space-x-4">
                          {fileInfo.type === 'image' ? (
                            <img src={fileInfo.url} alt="Ad media preview" className="h-20 rounded" />
                          ) : (
                            <video src={fileInfo.url} controls className="h-20 rounded" />
                          )}
                          <Button type="button" variant="destructive" size="sm" onClick={() => setFileInfo(null)}>
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={() => {
                          const adName = form.watch('name')?.trim();
                          if (!adName) {
                            toast({
                              title: 'Missing information',
                              description: 'Please provide an ad name.',
                              variant: 'destructive',
                            });
                            return;
                          }
                          if (!fileInfo) {
                            toast({
                              title: 'Missing file',
                              description: 'Please upload an image or video for your ad.',
                              variant: 'destructive',
                            });
                            return;
                          }
                          setStep(1);
                        }}>
                        Next
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 1: Headline, URL + Preview */}
                {step === 1 && (
                  <motion.div
                    key="tiktok-step-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6"
                  >
                    <div className="space-y-6">
                      {/* Headline */}
                      <div>
                        <label htmlFor="headline" className="block text-sm mb-1 font-medium">Headline</label>
                        <input
                          id="headline"
                          type="text"
                          maxLength={80}
                          className="w-full border rounded px-3 py-2"
                          {...form.register('headline')}
                        />
                      </div>
                      {/* URL */}
                      <div>
                        <label htmlFor="url" className="block text-sm mb-1 font-medium">URL</label>
                        <input
                          id="url"
                          type="text"
                          className="w-full border rounded px-3 py-2"
                          {...form.register('url')}
                        />
                      </div>
                    </div>
                    <div>
                      <AdDialogPreview
                        fileInfo={fileInfo}
                        watchedFields={getWatchedFieldsForTikTok()}
                        platform={validPlatform}
                        limits={{ headline: 80 }}
                        variation={0}
                      />
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* -------- ALL OTHER PLATFORMS EXISTING LOGIC -------- */}
            {!isSnapchat && !isTikTok && (
              <>
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
              {/* Snap: only show create on last step (step=1), else continue */}
              {(isSnapchat || isTikTok) ? (
                step === 1 ? (
                  <Button
                    type="button"
                    onClick={async () => {
                      if (uploading) return;
                      // Validate
                      const adName = form.watch('name')?.trim();
                      const headline = form.watch('headline')?.trim();
                      const url = form.watch('url')?.trim();

                      if (!adName) {
                        toast({
                          title: 'Missing information',
                          description: 'Please provide an ad name.',
                          variant: 'destructive',
                        }); return;
                      }
                      if (!fileInfo) {
                        toast({
                          title: 'Missing file',
                          description: 'Please upload an image or video for your ad.',
                          variant: 'destructive',
                        }); return;
                      }
                      setUploading(true);
                      let uploadedFile = null;
                      if (fileInfo) {
                        uploadedFile = await uploadFile(fileInfo.file);
                        if (!uploadedFile) {
                          setUploading(false);
                          return;
                        }
                      }
                      try {
                        // TikTok has only name, headline, file_url, url (plus ad_type etc)
                        // Snapchat has name, brand_name, headline, file_url, url
                        let insertFields: any = {
                          name: adName,
                          adset_id: adsetId,
                          ad_type: fileInfo.type,
                          file_url: uploadedFile?.url,
                          file_type: fileInfo.file.type,
                          headline: headline || null,
                          brand
