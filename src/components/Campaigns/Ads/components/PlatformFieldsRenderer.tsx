
import React from 'react';
import { Platform } from '../../types/campaign';
import { GoogleAdFields } from './fields/GoogleAdFields';
import { MetaAdFields } from './fields/MetaAdFields';
import { SnapchatAdFields } from './fields/SnapchatAdFields';
import { TiktokAdFields } from './fields/TiktokAdFields';
import { DefaultAdFields } from './fields/DefaultAdFields';

interface Props {
  form: any;
  platform: Platform;
  aiGenerated: boolean;
}

export function PlatformFieldsRenderer({ form, platform, aiGenerated }: Props) {
  const commonProps = { form, aiGenerated };
  
  switch (platform) {
    case 'Google':
      return <GoogleAdFields {...commonProps} />;
    case 'Meta':
    case 'LinkedIn':
      return <MetaAdFields {...commonProps} />;
    case 'Snapchat':
      return <SnapchatAdFields {...commonProps} />;
    case 'Tiktok':
      return <TiktokAdFields {...commonProps} />;
    default:
      return <DefaultAdFields {...commonProps} />;
  }
}
