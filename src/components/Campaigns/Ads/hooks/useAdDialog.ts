
import { useState } from 'react';
import { AdFormData, Platform } from '../../types/campaign';
import { FileInfo } from '../types';

export const useAdDialog = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  const resetDialog = (
    setFileInfo: (fileInfo: FileInfo | null) => void,
    form: { reset: () => void }
  ) => {
    setStep(0);
    setFileInfo(null);
    form.reset();
  };

  const validateStep = (
    step: number,
    form: { watch: (name: string) => any },
    fileInfo: FileInfo | null,
    platform: Platform,
    requiresMediaUpload: (platform: Platform) => boolean,
    toast: any
  ) => {
    if (step === 0) {
      const name = form.watch('name');
      if (!name) {
        toast({
          title: 'Missing information',
          description: 'Please provide an ad name.',
          variant: 'destructive',
        });
        return false;
      }
      
      if (requiresMediaUpload(platform) && step === 0 && !fileInfo) {
        toast({
          title: 'Missing file',
          description: 'Please upload an image or video for your ad.',
          variant: 'destructive',
        });
        return false;
      }
    }

    // Platform-specific validations can be added here
    if (platform === 'Tiktok') {
      if (step === 0) {
        // First step validation for TikTok (already handled in general step 0 validation)
        return true;
      } else if (step === 1) {
        // Second step validation for TikTok
        const headline = form.watch('headline');
        const url = form.watch('url');
        
        if (!headline || headline.trim() === '') {
          toast({
            title: 'Missing headline',
            description: 'Please provide a headline for your TikTok ad.',
            variant: 'destructive',
          });
          return false;
        }
        
        if (!url || url.trim() === '') {
          toast({
            title: 'Missing URL',
            description: 'Please provide a URL for your TikTok ad.',
            variant: 'destructive',
          });
          return false;
        }
      }
    }
    
    return true;
  };

  return {
    open,
    setOpen,
    step,
    setStep,
    resetDialog,
    validateStep,
  };
};
