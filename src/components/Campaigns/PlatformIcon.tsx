
import React from 'react';
import { Facebook, Laptop, Linkedin, Mail, Share } from 'lucide-react';
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

  const validPlatform = platform as Platform;
  
  switch(validPlatform) {
    case 'Meta':
      return <Facebook size={size} className={cn("text-blue-600", className)} />;
    case 'LinkedIn':
      return <Linkedin size={size} className={cn("text-blue-700", className)} />;
    case 'Google':
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width={size} 
          height={size} 
          className={cn("fill-current text-red-500", className)}
        >
          <path d="M22.5 11.63h-10v3.75h5.72a5.48 5.48 0 0 1-5.72 4.37 6.25 6.25 0 0 1 0-12.5 6.1 6.1 0 0 1 4.28 1.66l2.75-2.75A10.25 10.25 0 0 0 12 2.5 10 10 0 1 0 22.5 12v-.37Z"/>
        </svg>
      );
    case 'Tiktok':
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width={size} 
          height={size} 
          className={cn("fill-current text-black", className)}
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1Z"/>
        </svg>
      );
    case 'Snapchat':
      return (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          width={size} 
          height={size} 
          className={cn("fill-current text-yellow-400", className)}
        >
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm5.5 14a.5.5 0 0 1-.5.5c-1.5-.5-2.5-.5-3.5 1-1.5-.5-2.5-.5-2.5-.5a4 4 0 0 1-2-2.5 7.5 7.5 0 0 1 0-5h2a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5h2a7.5 7.5 0 0 1 0 5 2.5 2.5 0 0 1-1 1.5Z"/>
        </svg>
      );
    default:
      return <Laptop size={size} className={cn("text-gray-500", className)} />;
  }
};
