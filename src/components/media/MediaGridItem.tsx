
import React, { useState } from 'react';
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
  Menu,
  HeartIcon,
  FolderIcon,
  FileImageIcon,
  FileVideoIcon,
  FileTextIcon,
  Download,
  Trash2,
  Pencil,
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  // Function to handle file download
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create a hidden anchor element to trigger download
    const downloadLink = document.createElement('a');
    downloadLink.href = item.url;
    downloadLink.download = item.name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <Card className={`${item.isFolder ? 
      "cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary/30 relative group" : 
      "overflow-hidden relative"} w-full aspect-[4/5]`}>
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
              {item.isFolder 
                ? `${item.fileCount || 0} files`
                : formatFileSize(item.size)
              }
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

        {!item.isFolder && (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm border shadow-sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div 
              className={`absolute right-0 top-12 transition-all duration-300 ease-in-out transform ${
                isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              }`}
            >
              <div className="mr-2 p-1 flex flex-col gap-1 bg-background/90 rounded-l-lg backdrop-blur-sm border shadow-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFavorite(filePath, item.favorited, e);
                        }}
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
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full"
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Download file
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.name, false);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Delete file
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </>
        )}

        {item.isFolder && (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm border shadow-sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div 
              className={`absolute right-0 top-12 transition-all duration-300 ease-in-out transform ${
                isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              }`}
            >
              <div className="mr-2 p-1 flex flex-col gap-1 bg-background/90 rounded-l-lg backdrop-blur-sm border shadow-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRename?.(item.name);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Rename folder
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.name, true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Delete folder
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </>
        )}
        
        {item.favorited && !item.isFolder && (
          <div className="absolute top-2 left-2">
            <HeartIcon className="h-5 w-5 fill-red-500 text-red-500" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
