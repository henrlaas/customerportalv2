import { AdPreviewProps } from './types';

export function AdPreview({ fileInfo, watchedFields, platform, limits }: AdPreviewProps) {
  function platformName(platform: string): string {
    return platform || 'Unknown';
  }

  function formatFieldName(field: string): string {
    return field
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <div className="border rounded-lg p-4 bg-muted/20">
      <h3 className="font-semibold mb-4 text-lg">Ad Preview</h3>
      <div className="border rounded-md p-3 space-y-4 bg-white">
        <div className="relative h-40 bg-gray-100 rounded-md overflow-hidden">
          {fileInfo?.type === 'image' ? (
            watchedFields.url ? (
              <a 
                href={watchedFields.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block"
              >
                <img
                  src={fileInfo.url}
                  alt="Ad preview"
                  className="w-full h-full object-contain cursor-pointer"
                />
              </a>
            ) : (
              <img
                src={fileInfo.url}
                alt="Ad preview"
                className="w-full h-full object-contain"
              />
            )
          ) : fileInfo?.type === 'video' ? (
            <video
              src={fileInfo.url}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No media preview
            </div>
          )}
        </div>

        <div className="space-y-2">
          {watchedFields.headline && (
            <div className="text-base font-medium line-clamp-2">{watchedFields.headline}</div>
          )}

          {watchedFields.brand_name && (
            <div className="text-sm text-muted-foreground">{watchedFields.brand_name}</div>
          )}

          {watchedFields.main_text && (
            <div className="text-sm line-clamp-3">{watchedFields.main_text}</div>
          )}

          {watchedFields.description && (
            <div className="text-xs text-muted-foreground line-clamp-2">{watchedFields.description}</div>
          )}

          {watchedFields.keywords && (
            <div className="text-xs">
              <span className="text-muted-foreground">Keywords:</span> {watchedFields.keywords}
            </div>
          )}

          {watchedFields.cta_button && (
            <div className="mt-2">
              <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-md">
                {watchedFields.cta_button}
              </span>
            </div>
          )}
        </div>

        {watchedFields.url && (
          <div className="text-xs text-muted-foreground mt-2">
            URL: {watchedFields.url}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>Platform: {platformName(platform)} Ad</p>
        {limits && Object.keys(limits).length > 0 && (
          <ul className="mt-2 list-disc list-inside">
            {Object.entries(limits).map(([key, limit]) => (
              <li key={key}>{formatFieldName(key)}: max {limit} characters</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
