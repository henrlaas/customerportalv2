
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
    <div className="p-4 space-y-3">
      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
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
          <CardHeader className="pb-2">
            <CardTitle className="text-xs">Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-3">
            {Object.entries(limits).map(([field, limit]) => (
              <div key={field} className="flex justify-between text-xs">
                <span className="capitalize text-xs truncate">{String(field).replace('_', ' ')}</span>
                <span className="text-muted-foreground text-xs ml-1">{Number(limit)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
