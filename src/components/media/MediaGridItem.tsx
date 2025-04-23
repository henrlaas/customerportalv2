
import React from 'react';
import { MediaFile } from '@/types/media';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ChevronDown,
  HeartIcon,
  FolderIcon,
  FileImageIcon,
  FileVideoIcon,
  FileTextIcon,
} from 'lucide-react';
import { formatFileSize } from '@/utils/mediaUtils';

interface MediaGridItemProps {
  item: MediaFile;
  onNavigate?: (folderName: string) => void;
  onFavorite: (filePath: string, isFavorited: boolean, event?: React.MouseEvent) => void;
  onDelete: (name: string, isFolder: boolean) => void;
  onRename?: (name: string) => void;
  currentPath: string;
  getUploaderDisplayName: (userId: string) => string;
}

export const MediaGridItem: React.FC<MediaGridItemProps> = ({
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
      return <FolderIcon className="h-12 w-12 mb-2 text-blue-400" />;
    } else if (file.fileType.startsWith('image/')) {
      return <FileImageIcon className="h-12 w-12 mb-2 text-green-500" />;
    } else if (file.fileType.startsWith('video/')) {
      return <FileVideoIcon className="h-12 w-12 mb-2 text-red-500" />;
    } else {
      return <FileTextIcon className="h-12 w-12 mb-2 text-gray-500" />;
    }
  };

  return (
    <Card className={`${item.isFolder ? 
      "cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary/30 relative group" : 
      "overflow-hidden"} w-full aspect-[4/5]`}>
      <CardContent className="p-0 h-full flex flex-col">
        <div 
          className="flex-1 p-4 flex flex-col items-center justify-center"
          onClick={() => item.isFolder && onNavigate?.(item.name)}
        >
          {item.fileType.startsWith('image/') ? (
            <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
              <img 
                src={item.url} 
                alt={item.name} 
                className="max-h-full max-w-full object-contain" 
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              {getFileIcon(item)}
            </div>
          )}
        </div>
        
        <div className="w-full p-4 border-t bg-muted/10">
          <div className="w-full">
            <p className="font-medium truncate mb-2" title={item.name}>
              {item.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(item.size)}
            </p>
            {!item.isFolder && item.uploadedBy && (
              <div className="flex items-center gap-2 mt-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={item.uploaderAvatarUrl} />
                  <AvatarFallback className="text-xs">
                    {getUserInitials(getUploaderDisplayName(item.uploadedBy))}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate">
                  {getUploaderDisplayName(item.uploadedBy)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!item.isFolder && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-full bg-black/20 hover:bg-black/30 text-white"
                    onClick={(e) => onFavorite(filePath, item.favorited, e)}
                  >
                    <HeartIcon 
                      className={`h-4 w-4 ${item.favorited ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {item.favorited ? 'Remove from favorites' : 'Add to favorites'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full bg-black/20 hover:bg-black/30 text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
        </div>
        {item.favorited && !item.isFolder && (
          <div className="absolute top-0 left-0 m-2">
            <HeartIcon className="h-4 w-4 fill-red-500 text-red-500" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
