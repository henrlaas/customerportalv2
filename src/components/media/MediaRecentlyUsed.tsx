
import React from 'react';
import { MediaFile } from '@/types/media';
import { Card, CardContent } from '@/components/ui/card';
import { FolderIcon, FileImageIcon, FileVideoIcon, FileTextIcon } from 'lucide-react';
import { formatFileSize } from '@/utils/mediaUtils';
import { CompanyFavicon } from '@/components/CompanyFavicon';

interface MediaRecentlyUsedProps {
  recentItems: MediaFile[];
  onNavigate?: (folderName: string) => void;
  onFileOpen?: (file: MediaFile) => void;
}

export const MediaRecentlyUsed: React.FC<MediaRecentlyUsedProps> = ({
  recentItems,
  onNavigate,
  onFileOpen,
}) => {
  if (!recentItems.length) {
    return null;
  }

  const getFileIcon = (file: MediaFile) => {
    if (file.isFolder) {
      if (file.isCompanyFolder && file.companyName) {
        return (
          <CompanyFavicon 
            companyName={file.companyName}
            website={file.companyWebsite}
            logoUrl={file.companyLogoUrl}
            size="sm"
          />
        );
      }
      return <FolderIcon className="h-8 w-8 text-blue-500" />;
    } else if (file.fileType.startsWith('image/')) {
      return <FileImageIcon className="h-8 w-8 text-green-500" />;
    } else if (file.fileType.startsWith('video/')) {
      return <FileVideoIcon className="h-8 w-8 text-red-500" />;
    } else {
      return <FileTextIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const handleItemClick = (item: MediaFile) => {
    if (item.isFolder && onNavigate) {
      onNavigate(item.name);
    } else if (!item.isFolder && onFileOpen) {
      onFileOpen(item);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Recently Used</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {recentItems.slice(0, 6).map((item) => (
          <Card 
            key={item.id}
            className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-primary/20"
            onClick={() => handleItemClick(item)}
          >
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="mb-3 flex items-center justify-center">
                {item.fileType.startsWith('image/') && !item.isFolder ? (
                  <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img 
                      src={item.url} 
                      alt={item.name} 
                      className="max-h-full max-w-full object-cover" 
                    />
                  </div>
                ) : (
                  getFileIcon(item)
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 truncate w-full" title={item.name}>
                {item.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {item.isFolder 
                  ? `${item.fileCount || 0} items`
                  : formatFileSize(item.size)
                }
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
