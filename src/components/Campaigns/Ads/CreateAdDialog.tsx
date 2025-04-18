
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Check, Camera, Link, Zap, Sparkles, FileText, Globe } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { AdFormData, PLATFORM_CHARACTER_LIMITS, Platform } from '../types/campaign';
import { FileInfo, WatchedFields } from './types';
import { AdPreview } from './AdPreview';
import { TextVariation, getStepsForPlatform, requiresMediaUpload } from './types/variations';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { AdProgressStepper } from './AdProgressStepper';
import '../animations.css';
import { BasicInfoStep } from './Steps/BasicInfoStep';
import { UrlAndCtaStep } from './Steps/UrlAndCtaStep';
import { VariationStep } from './Steps/VariationStep';
import { ConfirmationStep } from './Steps/ConfirmationStep';

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
  
  // Add a new step for URL and CTA right after the first step
  const baseSteps = getStepsForPlatform(validPlatform);
  
  const urlStep = {
    title: 'Landing Page & CTA',
    description: 'Add your destination URL and call-to-action',
    fields: [],
    showBasicFields: false
  };

  // Add a confirmation step at the end
  const confirmationStep = {
    title: 'Confirm & Create',
    description: 'Review your ad details and create your ad',
    fields: [],
    showBasicFields: false
  };
  
  // Insert the URL step after the first step and add confirmation as the last step
  const steps = [
    baseSteps[0], // Basic Info
    urlStep,      // URL & CTA step (now second)
    ...baseSteps.slice(1, baseSteps.length), // Variation steps
    confirmationStep // Final confirmation step
  ];

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
    const baseValue = form.watch(field as any);
    if (baseValue) {
      variations.push({ text: baseValue });
    }
    
    // Add other variations if they exist
    // Skip the URL step which doesn't have variations
    const variationsCount = baseSteps.length - 1;
    
    for (let i = 1; i < variationsCount; i++) {
      const variationKey = `${field}_variations.${i-1}.text`;
      const value = form.watch(variationKey as any);
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

  const getStepIcon = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return <Camera className="h-5 w-5 text-primary" />;
      case 1: // URL & CTA step
        return <Globe className="h-5 w-5 text-primary" />;
      case steps.length - 1: // Last step
        return <FileText className="h-5 w-5 text-primary" />;
      default:
        return <FileText className="h-5 w-5 text-primary" />;
    }
  };

  // Render preview component
  const renderPreview = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex flex-col"
    >
      <Card className="border-primary/10 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-background to-muted/20 h-full">
        <CardContent className="p-6 h-full">
          <div className="text-lg font-medium text-primary mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Ad Preview
          </div>
          <AdPreview
            fileInfo={fileInfo}
            watchedFields={watchedFields}
            platform={validPlatform}
            limits={limits}
          />
        </CardContent>
      </Card>
    </motion.div>
  );

  const showPreview = (currentStep: number) => {
    // Only show preview for URL step and variations
    if (currentStep === 1) return true;
    
    if (currentStep > 1 && currentStep < steps.length - 1) {
      return ((validPlatform === 'Meta' || validPlatform === 'LinkedIn') || 
        (validPlatform === 'Google' && currentStep === steps.length - 2) ||
        (validPlatform === 'Snapchat' && currentStep > 1) ||
        (validPlatform === 'Tiktok' && currentStep > 1));
    }
    
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetDialog();
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
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            Create New Ad
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6">
          <AdProgressStepper currentStep={step + 1} totalSteps={steps.length} />
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  <Card className="border-primary/10 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
                    <CardContent className="p-6">
                      <BasicInfoStep
                        fileInfo={fileInfo}
                        onFileChange={handleFileChange}
                        onRemoveFile={() => setFileInfo(null)}
                        form={form}
                        onNextStep={nextStep}
                        hideFileUpload={!requiresMediaUpload(validPlatform)}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {/* URL and CTA step - second step */}
              {step === 1 && (
                <motion.div
                  key="step-url-cta"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6"
                >
                  <div className="space-y-6">
                    <Card className="border-primary/10 shadow-sm transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
                      <CardContent className="p-6 space-y-6">
                        <UrlAndCtaStep form={form} />
                      </CardContent>
                    </Card>
                  </div>
                  
                  {renderPreview()}
                </motion.div>
              )}
              
              {/* Variation steps */}
              {step > 1 && step < steps.length - 1 && (
                <motion.div
                  key={`step-${step}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6"
                >
                  <div className="space-y-6">
                    <Card className="border-primary/10 shadow-sm transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
                      <CardContent className="p-6 space-y-6">
                        <div className="flex items-center gap-2 text-lg font-medium text-primary mb-2">
                          {getStepIcon(step)}
                          <h3>{steps[step].title || `Variation ${step}`}</h3>
                        </div>
                        
                        <VariationStep
                          form={form}
                          platform={validPlatform}
                          variation={step}
                          fields={steps[step].fields || []}
                          showBasicFields={steps[step].showBasicFields}
                        />
                      </CardContent>
                    </Card>
                  </div>
                  
                  {showPreview(step) && renderPreview()}
                </motion.div>
              )}

              {/* Confirmation step */}
              {step === steps.length - 1 && (
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
                onClick={previousStep}
                className={cn(
                  "transition-all duration-200 hover:bg-primary/10",
                  step === 0 && "opacity-50 cursor-not-allowed"
                )}
                disabled={step === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              {step === steps.length - 1 ? (
                <Button 
                  type="submit" 
                  disabled={uploading}
                  className="transition-all duration-200 hover:bg-primary-foreground/90 hover:text-primary hover:scale-105 shadow-sm hover:shadow-md"
                >
                  {uploading ? 'Creating...' : 'Create Ad'} 
                  {!uploading && <Check className="ml-2 h-4 w-4" />}
                </Button>
              ) : (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                >
                  Next
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
