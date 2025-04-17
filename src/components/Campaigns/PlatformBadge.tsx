
import React from 'react';
import { Platform } from './types/campaign';
import { cn } from '@/lib/utils';
import { PLATFORM_COLORS } from './CreateCampaignDialog/PlatformSelector';

interface PlatformBadgeProps {
  platform: Platform | string | null;
  className?: string;
}

export const PlatformBadge = ({ platform, className }: PlatformBadgeProps) => {
  if (!platform) return null;
  
  // Safely cast platform string to Platform type if it matches
  const validPlatform = platform as Platform;
  
  // Check if the platform is one we recognize
  if (!PLATFORM_COLORS[validPlatform]) return null;
  
  const { bg, text } = PLATFORM_COLORS[validPlatform];
  
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium", 
        text,
        className
      )}
      style={{ backgroundColor: bg }}
    >
      <i className={`fa-brands fa-${validPlatform.toLowerCase().replace('linkedin', 'linkedin-in')}`}></i>
      <span>{validPlatform}</span>
    </div>
  );
};
