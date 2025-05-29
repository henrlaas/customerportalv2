
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Zap, Tag, Building } from 'lucide-react';
import { Platform } from '@/components/Campaigns/types/campaign';

interface ContentPreviewProps {
  ad: any;
  platform: Platform;
}

export function AdContentPreview({ ad, platform }: ContentPreviewProps) {
  const renderMetaContent = () => (
    <div className="space-y-4">
      {ad.headline && (
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Headline</h4>
          <p className="text-lg font-medium">{ad.headline}</p>
        </div>
      )}
      {ad.main_text && (
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Main Text</h4>
          <p className="text-sm">{ad.main_text}</p>
        </div>
      )}
      {ad.description && (
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Description</h4>
          <p className="text-sm text-muted-foreground">{ad.description}</p>
        </div>
      )}
    </div>
  );

  const renderGoogleContent = () => (
    <div className="space-y-4">
      {ad.headline && (
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Headline</h4>
          <p className="text-lg font-medium text-blue-600">{ad.headline}</p>
        </div>
      )}
      {ad.description && (
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Description</h4>
          <p className="text-sm">{ad.description}</p>
        </div>
      )}
      {ad.keywords && (
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1 flex items-center gap-1">
            <Tag className="h-4 w-4" />
            Keywords
          </h4>
          <div className="flex flex-wrap gap-1">
            {ad.keywords.split(',').map((keyword: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {keyword.trim()}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSnapchatContent = () => (
    <div className="space-y-4">
      {ad.headline && (
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Headline</h4>
          <p className="text-lg font-medium">{ad.headline}</p>
        </div>
      )}
      {ad.brand_name && (
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1 flex items-center gap-1">
            <Building className="h-4 w-4" />
            Brand Name
          </h4>
          <p className="text-sm font-medium">{ad.brand_name}</p>
        </div>
      )}
    </div>
  );

  const renderTiktokContent = () => (
    <div className="space-y-4">
      {ad.headline && (
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Headline</h4>
          <p className="text-lg font-medium">{ad.headline}</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (platform) {
      case 'Google':
        return renderGoogleContent();
      case 'Snapchat':
        return renderSnapchatContent();
      case 'Tiktok':
        return renderTiktokContent();
      case 'Meta':
      case 'LinkedIn':
      default:
        return renderMetaContent();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Ad Content Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderContent()}
        
        {/* URL and CTA */}
        <div className="pt-4 border-t space-y-3">
          {ad.url && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1">Landing Page URL</h4>
              <a
                href={ad.url}
                className="text-blue-600 hover:text-blue-800 break-all text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                {ad.url}
              </a>
            </div>
          )}
          {ad.cta_button && (
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-1 flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Call to Action
              </h4>
              <Badge variant="outline">{ad.cta_button}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
