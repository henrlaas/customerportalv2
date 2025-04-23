import React from 'react';
import { MediaFile } from '@/types/media';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  HeartIcon,
  FolderIcon,
  FileImageIcon,
  FileVideoIcon,
  FileTextIcon,
  Download,
  Trash2,
} from 'lucide-react';
import { formatFileSize } from '@/utils/mediaUtils';

interface MediaListItemProps {
  item: MediaFile;
  onNavigate?: (folderName: string) => void;
  onFavorite: (filePath: string, isFavorited: boolean, event?: React.MouseEvent) => void;
  onDelete: (name: string, isFolder: boolean) => void;
  onRename?: (name: string) => void;
  currentPath: string;
  getUploaderDisplayName: (userId: string) => string;
}

export const MediaListItem: React.FC<MediaListItemProps> = ({
  item,
  onNavigate,
  onFavorite,
  onDelete,
  onRename,
  currentPath,
  getUploaderDisplayName,
}) => {
  const filePath = currentPath 
    ? `${currentPath}/${item.name}`
    : item.name;
    
  // Check if this is a company folder (in the root of companies tab)
  const isCompanyFolder = currentPath === '' && filePath.startsWith('companies/');

  // Function to get user initials
  const getUserInitials = (displayName: string) => {
    return displayName
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getFileIcon = (file: MediaFile) => {
    if (file.isFolder) {
      return <FolderIcon className="h-5 w-5 text-blue-400" />;
    } else if (file.fileType.startsWith('image/')) {
      return <FileImageIcon className="h-5 w-5 text-green-500" />;
    } else if (file.fileType.startsWith('video/')) {
      return <FileVideoIcon className="h-5 w-5 text-red-500" />;
    } else {
      return <FileTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div 
      className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 group"
      onClick={() => item.isFolder && onNavigate?.(item.name)}
    >
      <div className="flex items-center flex-1 min-w-0">
        <div className="flex-shrink-0 mr-3">
          {item.fileType.startsWith('image/') && !item.isFolder ? (
            <div className="h-10 w-10 rounded overflow-hidden flex items-center justify-center bg-muted">
              <img 
                src={item.url} 
                alt={item.name} 
                className="max-h-full max-w-full object-contain" 
              />
            </div>
          ) : (
            <div className="h-10 w-10 flex items-center justify-center">
              {getFileIcon(item)}
            </div>
          )}
        </div>
        <div className="truncate">
          <p className="font-medium truncate" title={item.name}>
            {item.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {item.isFolder 
                ? `${item.fileCount || 0} files`
                : formatFileSize(item.size)
              }
            </span>
            {!item.isFolder && item.uploadedBy && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={item.uploaderAvatarUrl} />
                    <AvatarFallback className="text-xs">
                      {getUserInitials(getUploaderDisplayName(item.uploadedBy))}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {getUploaderDisplayName(item.uploadedBy)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {!item.isFolder && (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(filePath, item.favorited, e);
              }}
              aria-label={item.favorited ? "Remove from favorites" : "Add to favorites"}
            >
              <HeartIcon 
                className={`h-4 w-4 ${item.favorited ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                window.open(item.url, '_blank');
              }}
              aria-label="Download file"
              asChild
            >
              <a href={item.url} download={item.name} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.name, false);
              }}
              aria-label="Delete file"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {/* Only show dropdown for files and non-company folders */}
        {!isCompanyFolder && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white z-50">
              {item.isFolder ? (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onRename?.(item.name);
                    }}
                  >
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.name, true);
                    }}
                  >
                    Delete
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <a href={item.url} download={item.name} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500"
                    onClick={() => onDelete(item.name, false)}
                  >
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
