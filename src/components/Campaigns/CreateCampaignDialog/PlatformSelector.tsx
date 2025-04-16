
import React from 'react';
import { Button } from '@/components/ui/button';
import { Platform } from '../types/campaign';
import { Facebook, MessageCircle, Search, Linkedin, Youtube } from 'lucide-react';

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

import { cn } from '@/lib/utils';

export function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  const platforms: { value: Platform; label: string; icon: React.ReactNode }[] = [
    { value: 'Meta', label: 'Meta', icon: <Facebook size={24} /> },
    { value: 'Google', label: 'Google', icon: <Search size={24} /> },
    { value: 'LinkedIn', label: 'LinkedIn', icon: <Linkedin size={24} /> },
    { value: 'Snapchat', label: 'Snapchat', icon: <MessageCircle size={24} /> },
    { value: 'Tiktok', label: 'Tiktok', icon: <Youtube size={24} /> },
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
