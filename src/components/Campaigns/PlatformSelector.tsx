
import React from 'react';
import { Platform, PLATFORM_COLORS } from './types/campaign';
import { cn } from '@/lib/utils';

interface PlatformSelectorProps {
  selectedPlatforms: Platform[];
  onPlatformsChange: (platforms: Platform[]) => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatforms,
  onPlatformsChange,
}) => {
  const platforms: Platform[] = ['Meta', 'Google', 'LinkedIn', 'Snapchat', 'Tiktok'];

  const togglePlatform = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      // Remove platform from selection
      onPlatformsChange(selectedPlatforms.filter(p => p !== platform));
    } else {
      // Add platform to selection
      onPlatformsChange([...selectedPlatforms, platform]);
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'Meta':
        return 'fa-meta';
      case 'Google':
        return 'fa-google';
      case 'LinkedIn':
        return 'fa-linkedin-in';
      case 'Snapchat':
        return 'fa-snapchat';
      case 'Tiktok':
        return 'fa-tiktok';
      default:
        return 'fa-circle';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {platforms.map((platform) => {
        const isSelected = selectedPlatforms.includes(platform);
        const colors = PLATFORM_COLORS[platform];
        
        return (
          <button
            key={platform}
            onClick={() => togglePlatform(platform)}
            className={cn(
              "inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105",
              isSelected 
                ? "shadow-sm" 
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            )}
            style={isSelected ? { 
              backgroundColor: colors.bg, 
              color: colors.text 
            } : {}}
            title={`${isSelected ? 'Hide' : 'Show'} ${platform} campaigns`}
            aria-label={`Toggle ${platform} filter`}
          >
            <i className={`fa-brands ${getPlatformIcon(platform)}`} aria-hidden="true"></i>
          </button>
        );
      })}
    </div>
  );
};
