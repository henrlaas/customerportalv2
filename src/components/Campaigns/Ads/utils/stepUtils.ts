
import { Platform } from '../../types/campaign';
import { ReactNode } from 'react';

export const getStepIcon = (stepIndex: number, icons: { Camera: any; Globe: any; FileText: any }): ReactNode => {
  switch (stepIndex) {
    case 0:
      return icons.Camera && { type: icons.Camera, props: { className: "h-5 w-5 text-primary" } };
    case 1:
      return icons.Globe && { type: icons.Globe, props: { className: "h-5 w-5 text-primary" } };
    default:
      return icons.FileText && { type: icons.FileText, props: { className: "h-5 w-5 text-primary" } };
  }
};

export const showPreview = (currentStep: number, validPlatform: Platform, stepsLength: number) => {
  if (currentStep === 1) return true;
  
  if (currentStep > 1 && currentStep < stepsLength - 1) {
    return ((validPlatform === 'Meta' || validPlatform === 'LinkedIn') || 
      (validPlatform === 'Google' && currentStep === stepsLength - 2) ||
      (validPlatform === 'Snapchat' && currentStep > 1) ||
      (validPlatform === 'Tiktok' && currentStep > 1));
  }
  
  return false;
};
