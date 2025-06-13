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
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
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
import { useDraggable } from '@dnd-kit/core';
import { CompanyFavicon } from '@/components/CompanyFavicon';

interface MediaGridItemProps {
  item: MediaFile;
  onNavigate?: (folderName: string) => void;
  onFavorite: (filePath: string, isFavorited: boolean, event?: React.MouseEvent) => void;
  onDelete: (name: string, isFolder: boolean, bucketId?: string) => void;
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

  // Check if this is a company root folder (in the root of companies tab)
  const isCompanyRootFolder = item.isCompanyFolder && !currentPath;

  const handleFolderClick = () => {
    if (item.isFolder && onNavigate) {
      onNavigate(item.name);
    }
  };

  const getFileIcon = (file: MediaFile) => {
    if (file.isFolder) {
      // Show company favicon for company folders
      if (file.isCompanyFolder && file.companyName) {
        return (
          <CompanyFavicon 
            companyName={file.companyName}
            website={file.companyWebsite}
            logoUrl={file.companyLogoUrl}
            size="lg"
          />
        );
      }
      return <FolderIcon className="h-10 w-10 text-blue-400" />;
    } else if (file.fileType.startsWith('image/')) {
      return <FileImageIcon className="h-12 w-12 mb-2 text-green-500" />;
    } else if (file.fileType.startsWith('video/')) {
      return <FileVideoIcon className="h-12 w-12 mb-2 text-red-500" />;
    } else {
      return <FileTextIcon className="h-12 w-12 mb-2 text-gray-500" />;
    }
  };

  // Setup draggable for the file
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: item, // Make sure the item data is available in drag events
    disabled: item.isFolder || (item.isCompanyFolder && !currentPath)
  });

  // Apply dragging style
  const dragStyle = {
    opacity: isDragging ? 0.4 : undefined,
    cursor: item.isFolder ? 'pointer' : 'grab',
  };

  return (
    <Card 
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`
        w-full ${item.isFolder ? "h-[200px]" : "h-[260px]"} flex flex-col 
        ${item.isFolder 
          ? "cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary/30 relative group" 
          : "overflow-hidden relative"
        }
      `}
      style={dragStyle}
      onClick={item.isFolder ? handleFolderClick : undefined}
    >
      <CardContent className="p-0 flex-1 flex flex-col h-full">
        <div 
          className={`
            ${item.isFolder ? "h-24" : "h-36"} 
            p-4 flex items-center justify-center
          `}
        >
          {item.fileType.startsWith('image/') && !item.isFolder ? (
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <img 
                src={item.url} 
                alt={item.name} 
                className="max-h-full max-w-full object-contain" 
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <div className="flex justify-center items-center w-full">
                {getFileIcon(item)}
              </div>
            </div>
          )}
        </div>
        
        <div className="w-full p-4 border-t bg-muted/10 mt-auto flex-shrink-0">
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

        {/* Show action menu for all files and folders except company root folders */}
        {!isCompanyRootFolder && (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm border shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div 
              className={`absolute right-0 top-12 transition-all duration-300 ease-in-out transform ${
                isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              }`}
            >
              <div className="mr-2 p-1 flex flex-col gap-1 bg-background/90 rounded-l-lg backdrop-blur-sm border shadow-sm">
                {!item.isFolder && (
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
                )}
                
                {!item.isFolder && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            const downloadLink = document.createElement('a');
                            downloadLink.href = item.url;
                            downloadLink.download = item.name;
                            document.body.appendChild(downloadLink);
                            downloadLink.click();
                            document.body.removeChild(downloadLink);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Download file
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {/* Show rename option for any folders except company root folders */}
                {item.isFolder && onRename && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRename(item.name);
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
                )}
                
                {/* Show delete for all files and folders except company root folders */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.name, item.isFolder, item.bucketId);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {item.isFolder ? 'Delete folder' : 'Delete file'}
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

// Helper function to get user initials
function getUserInitials(displayName: string) {
  return displayName
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}
