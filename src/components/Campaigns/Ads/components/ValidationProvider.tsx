
import React from 'react';
import { Platform } from '../../types/campaign';

interface Props {
  platform: Platform;
  children: React.ReactNode;
}

export function ValidationProvider({ platform, children }: Props) {
  // This component can be expanded to provide validation context
  // For now, it's a simple wrapper but can be enhanced with validation logic
  
  return (
    <div data-platform={platform}>
      {children}
    </div>
  );
}
