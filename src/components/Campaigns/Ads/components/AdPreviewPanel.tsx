
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Eye } from 'lucide-react';
import { Platform } from '../../types/campaign';
import { FileInfo } from '../types';
import { AdPreview } from '../AdPreview';
import { PLATFORM_CHARACTER_LIMITS } from '../../types/campaign';

interface Props {
  formData: any;
  fileInfo: FileInfo | null;
  platform: Platform;
}

export function AdPreviewPanel({ formData, fileInfo, platform }: Props) {
  const limits = PLATFORM_CHARACTER_LIMITS[platform] || {};
  
  const watchedFields = {
    headline: formData.headline || '',
    description: formData.description || '',
    main_text: formData.main_text || '',
    keywords: formData.keywords || '',
    brand_name: formData.brand_name || '',
    cta_button: formData.cta_button || '',
    url: formData.url || '',
  };
  
  return (
    <div className="p-6 space-y-4">
      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AdPreview
            fileInfo={fileInfo}
            watchedFields={watchedFields}
            platform={platform}
            limits={limits}
            variation={0}
          />
        </CardContent>
      </Card>
      
      {/* Character Limits Info */}
      {Object.keys(limits).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Character Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(limits).map(([field, limit]) => (
              <div key={field} className="flex justify-between text-xs">
                <span className="capitalize">{String(field).replace('_', ' ')}</span>
                <span className="text-muted-foreground">{limit} chars</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
