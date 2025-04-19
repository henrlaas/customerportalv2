import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Check, Camera, FileText, Globe } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { AdFormData, PLATFORM_CHARACTER_LIMITS, Platform } from '../types/campaign';
import { requiresMediaUpload } from './types/variations';
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
import { getStepIcon, showPreview } from './utils/stepUtils';
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

  // Get current variation fields based on step
  const getWatchedFieldsForCurrentVariation = (): WatchedFields => {
    // For step 0 (basic info) or steps beyond variations, use the base fields
    if (step === 0 || step === 5) {
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
    
    // For variation steps (1-4), get the specific variation data
    const variation = step;
    return {
      headline: variation === 1 
        ? form.watch('headline') || '' 
        : form.watch(`headline_variations.${variation-1}.text`) || form.watch('headline') || '',
      description: variation === 1 
        ? form.watch('description') || '' 
        : form.watch(`description_variations.${variation-1}.text`) || form.watch('description') || '',
      main_text: variation === 1 
        ? form.watch('main_text') || '' 
        : form.watch(`main_text_variations.${variation-1}.text`) || form.watch('main_text') || '',
      keywords: form.watch('keywords') || '',
      brand_name: form.watch('brand_name') || '',
      cta_button: form.watch('cta_button') || '',
      url: form.watch('url') || '',
    };
  };

  const watchedFields = getWatchedFieldsForCurrentVariation();

  const baseSteps = [
    { 
      title: 'Basic Info', 
      description: 'Set your ad name and upload media',
      showBasicFields: true
    },
    { 
      title: 'Variation 1', 
      description: 'Create your first ad variation',
      fields: ['headline', 'description', 'main_text'],
      showBasicFields: true
    },
    { 
      title: 'Variation 2', 
      description: 'Add alternative headline, description and text',
      fields: ['headline', 'description', 'main_text']
    },
    { 
      title: 'Variation 3',
      description: 'Add alternative headline, description and text',
      fields: ['headline', 'description', 'main_text']
    },
    { 
      title: 'Variation 4',
      description: 'Add alternative headline, description and text',
      fields: ['headline', 'description', 'main_text']
    },
    { 
      title: 'Variation 5',
      description: 'Add alternative headline, description and text',
      fields: ['headline', 'description', 'main_text']
    }
  ];

  const limits = PLATFORM_CHARACTER_LIMITS[validPlatform] || {};
  
  // Helper function to render the icon
  const renderStepIcon = (stepIndex: number) => {
    const iconData = getStepIcon(stepIndex, { Camera, Globe, FileText });
    if (iconData && iconData.type) {
      return createElement(iconData.type, iconData.props);
    }
    return null;
  };

  const handleManualSubmit = async () => {
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
      const { error } = await supabase.from('ads').insert({
        ...data,
        ad_type: fileInfo?.type || 'text',
        file_url: uploadedFile?.url || null,
        file_type: fileInfo?.file.type || null,
        headline_variations: JSON.stringify(headlineVariations.slice(1)),
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
          <AdProgressStepper currentStep={step + 1} totalSteps={6} />
        </div>
        
        <Form {...form}>
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step-0"
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
              )}
              
              {step > 0 && step < 5 && (
                <motion.div
                  key={`step-${step}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6"
                >
                  <div className="space-y-6">
                    <VariationStep
                      form={form}
                      platform={validPlatform}
                      variation={step}
                      fields={baseSteps[step].fields || []}
                      showBasicFields={baseSteps[step].showBasicFields}
                    />
                  </div>
                  
                  {showPreview(step, validPlatform, baseSteps.length) && (
                    <AdDialogPreview
                      fileInfo={fileInfo}
                      watchedFields={watchedFields}
                      platform={validPlatform}
                      limits={limits}
                      variation={step}
                    />
                  )}
                </motion.div>
              )}

              {step === 5 && (
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
              )}
            </AnimatePresence>

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
              
              {step === 5 ? (
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
                    if (validateStepFn(step, form, fileInfo, validPlatform, requiresMediaUpload, toast)) {
                      setStep(step + 1);
                    }
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
