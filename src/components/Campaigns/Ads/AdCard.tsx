
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props {
  ad: any;
  campaignPlatform?: string;
  onAdUpdate?: () => void;
  disableModifications?: boolean;
}

export function AdCard({ ad, disableModifications }: Props) {
  const navigate = useNavigate();

  // Determine the file badge type
  const fileType = ad.ad_type === 'image'
    ? 'Image'
    : ad.ad_type === 'video'
    ? 'Video'
    : ad.file_type;

  return (
    <Card
      className="overflow-hidden cursor-pointer relative transition-all hover:shadow-lg group shadow-md bg-white"
      onClick={() => navigate(`/ads/${ad.id}`)}
      tabIndex={0}
      aria-label={`View details for ad ${ad.name}`}
    >
      {/* Ad Media */}
      {ad.file_url && (
        <div className="relative h-56 bg-muted flex items-center justify-center">
          {ad.ad_type === 'image' ? (
            <img
              src={ad.file_url}
              alt={ad.name}
              className="w-full h-full object-cover"
            />
          ) : ad.ad_type === 'video' ? (
            <video
              src={ad.file_url}
              controls={false}
              className="w-full h-full object-cover"
              tabIndex={-1}
              aria-label="Ad video preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              File: {ad.file_type}
            </div>
          )}
        </div>
      )}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="truncate font-medium text-base">{ad.name}</div>
        <Badge variant="outline">{fileType}</Badge>
      </div>
    </Card>
  );
}
