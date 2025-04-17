
import React from 'react';
import { Share } from 'lucide-react';
import { Platform, PLATFORM_COLORS } from './types/campaign';
import { cn } from '@/lib/utils';

interface PlatformIconProps {
  platform: Platform | null | string;
  size?: number;
  className?: string;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({ 
  platform,
  size = 16,
  className
}) => {
  if (!platform) {
    return <Share size={size} className={cn("text-gray-400", className)} />;
  }

  // Use Font Awesome icons similar to the campaign creation dialog
  return (
    <i 
      className={cn(
        `fa-brands fa-${platform.toString().toLowerCase().replace('linkedin', 'linkedin-in')}`,
        className
      )}
      style={{ fontSize: `${size}px`, color: platform === 'Google' ? '#34A853' : undefined }}
    ></i>
  );
};
