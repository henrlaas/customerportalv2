
import React from 'react';
import { Platform, PLATFORM_COLORS } from './types/campaign';
import { cn } from '@/lib/utils';

interface PlatformBadgeProps {
  platform: Platform | string | null;
  className?: string;
  showLabel?: boolean;
}

export const PlatformBadge = ({ platform, className, showLabel = false }: PlatformBadgeProps) => {
  if (!platform) return null;
  
  // Safely cast platform string to Platform type if it matches
  const validPlatform = platform as Platform;
  
  // Check if the platform is one we recognize
  if (!PLATFORM_COLORS[validPlatform]) return null;
  
  const { bg, text } = PLATFORM_COLORS[validPlatform];
  
  return (
    <div 
      className={cn(
        "inline-flex items-center justify-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium", 
        className
      )}
      style={{ backgroundColor: bg, color: text }}
    >
      <i className={`fa-brands fa-${validPlatform.toLowerCase().replace('linkedin', 'linkedin-in')}`}></i>
      {showLabel && <span>{validPlatform}</span>}
    </div>
  );
};
