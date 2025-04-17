
import React from 'react';
import { Button } from '@/components/ui/button';
import { Platform } from '../types/campaign';
import { cn } from '@/lib/utils';

interface PlatformOptionProps {
  value: Platform;
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: (value: Platform) => void;
}

const PlatformOption = ({ value, label, icon, selected, onSelect }: PlatformOptionProps) => {
  return (
    <Button
      type="button"
      variant={selected ? 'default' : 'outline'}
      className={cn(
        "flex flex-col h-auto py-4 px-2 gap-2 w-full justify-center items-center",
        selected ? "border-2 border-primary" : ""
      )}
      onClick={() => onSelect(value)}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
};

interface PlatformSelectorProps {
  value: Platform;
  onChange: (value: Platform) => void;
}

export function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  const platforms: { value: Platform; label: string; icon: React.ReactNode }[] = [
    { 
      value: 'Meta', 
      label: 'Meta', 
      icon: <i className="fa-brands fa-meta text-2xl" aria-hidden="true"></i> 
    },
    { 
      value: 'Google', 
      label: 'Google', 
      icon: <i className="fa-brands fa-google text-2xl" aria-hidden="true"></i> 
    },
    { 
      value: 'LinkedIn', 
      label: 'LinkedIn', 
      icon: <i className="fa-brands fa-linkedin-in text-2xl" aria-hidden="true"></i> 
    },
    { 
      value: 'Snapchat', 
      label: 'Snapchat', 
      icon: <i className="fa-brands fa-snapchat text-2xl" aria-hidden="true"></i> 
    },
    { 
      value: 'Tiktok', 
      label: 'Tiktok', 
      icon: <i className="fa-brands fa-tiktok text-2xl" aria-hidden="true"></i> 
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
        />
      ))}
    </div>
  );
}
