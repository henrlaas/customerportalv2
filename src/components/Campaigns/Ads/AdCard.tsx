
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  ad: any;
  campaignPlatform?: string;
}

export function AdCard({ ad, campaignPlatform }: Props) {
  return (
    <Card className="overflow-hidden">
      {ad.file_url && (
        <div className="relative h-48 bg-muted">
          {ad.ad_type === 'image' ? (
            <img 
              src={ad.file_url} 
              alt={ad.name} 
              className="w-full h-full object-cover"
            />
          ) : ad.ad_type === 'video' ? (
            <video 
              src={ad.file_url} 
              controls 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              File: {ad.file_type}
            </div>
          )}
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{ad.name}</CardTitle>
          <Badge variant="outline">{ad.ad_type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        {ad.headline && (
          <p><span className="font-medium">Headline:</span> {ad.headline}</p>
        )}
        {ad.description && (
          <p><span className="font-medium">Description:</span> {ad.description}</p>
        )}
        {ad.main_text && (
          <p><span className="font-medium">Main Text:</span> {ad.main_text}</p>
        )}
        {ad.keywords && (
          <p><span className="font-medium">Keywords:</span> {ad.keywords}</p>
        )}
        {ad.brand_name && (
          <p><span className="font-medium">Brand:</span> {ad.brand_name}</p>
        )}
      </CardContent>
    </Card>
  );
}
