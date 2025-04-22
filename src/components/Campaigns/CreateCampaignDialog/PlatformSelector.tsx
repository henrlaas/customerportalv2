
import React from 'react';
import { Button } from '@/components/ui/button';
import { Platform } from '../types/campaign';
import { cn } from '@/lib/utils';

interface PlatformOptionProps {
  value: Platform;
  label: string;
  icon: React.ReactElement; // Changed from ReactNode to ReactElement to ensure it's a React element
  selected: boolean;
  onSelect: (value: Platform) => void;
  brandColor: string;
}

// Brand colors for each platform
export const PLATFORM_COLORS = {
  Meta: {
    bg: '#0081FB',
    text: '#FFFFFF'
  },
  Google: {
    bg: '#34A853',
    text: '#FFFFFF'
  },
  LinkedIn: {
    bg: '#0077B5',
    text: '#FFFFFF'
  },
  Snapchat: {
    bg: '#FFFC00',
    text: '#000000'  // Explicitly set text to black
  },
  Tiktok: {
    bg: '#000000',
    text: '#FFFFFF'
  },
};

const PlatformOption = ({ value, label, icon, selected, onSelect, brandColor }: PlatformOptionProps) => {
  // Determine text color based on selected state and platform
  const textColorClass = selected ? PLATFORM_COLORS[value].text : 'text-foreground';
  
  return (
    <Button
      type="button"
      variant={selected ? 'default' : 'outline'}
      className={cn(
        "flex flex-col h-auto py-4 px-2 gap-2 w-full justify-center items-center",
        selected ? `border-2 ${textColorClass}` : ""
      )}
      onClick={() => onSelect(value)}
      style={selected ? { 
        backgroundColor: brandColor, 
        color: PLATFORM_COLORS[value].text  // Explicitly set text color
      } : {}}
    >
      {React.cloneElement(icon, { 
        className: cn(
          icon.props.className, 
          selected ? PLATFORM_COLORS[value].text : '' 
        ) 
      })}
      <span className={textColorClass}>{label}</span>
    </Button>
  );
};

interface PlatformSelectorProps {
  value: Platform;
  onChange: (value: Platform) => void;
}

export function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  const platforms: { value: Platform; label: string; icon: React.ReactElement; brandColor: string }[] = [
    { 
      value: 'Meta', 
      label: 'Meta', 
      icon: <i className={`fa-brands fa-meta text-2xl ${value === 'Meta' ? PLATFORM_COLORS.Meta.text : ''}`} aria-hidden="true"></i>,
      brandColor: PLATFORM_COLORS.Meta.bg
    },
    { 
      value: 'Google', 
      label: 'Google', 
      icon: <i className={`fa-brands fa-google text-2xl ${value === 'Google' ? PLATFORM_COLORS.Google.text : ''}`} aria-hidden="true"></i>,
      brandColor: PLATFORM_COLORS.Google.bg
    },
    { 
      value: 'LinkedIn', 
      label: 'LinkedIn', 
      icon: <i className={`fa-brands fa-linkedin-in text-2xl ${value === 'LinkedIn' ? PLATFORM_COLORS.LinkedIn.text : ''}`} aria-hidden="true"></i>,
      brandColor: PLATFORM_COLORS.LinkedIn.bg
    },
    { 
      value: 'Snapchat', 
      label: 'Snapchat', 
      icon: <i className={`fa-brands fa-snapchat text-2xl ${value === 'Snapchat' ? PLATFORM_COLORS.Snapchat.text : ''}`} aria-hidden="true"></i>,
      brandColor: PLATFORM_COLORS.Snapchat.bg
    },
    { 
      value: 'Tiktok', 
      label: 'Tiktok', 
      icon: <i className={`fa-brands fa-tiktok text-2xl ${value === 'Tiktok' ? PLATFORM_COLORS.Tiktok.text : ''}`} aria-hidden="true"></i>,
      brandColor: PLATFORM_COLORS.Tiktok.bg
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {platforms.map((platform) => (
        <PlatformOption
          key={platform.value}
          value={platform.value}
          label={platform.label}
          icon={platform.icon}
          selected={value === platform.value}
          onSelect={onChange}
          brandColor={platform.brandColor}
        />
      ))}
    </div>
  );
}
