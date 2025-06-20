
import React from 'react';
import { MediaFile } from '@/types/media';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HeartIcon,
  FolderIcon,
  FileImageIcon,
  FileVideoIcon,
  FileTextIcon,
  Download,
  Trash2,
  Pencil,
  MoreHorizontal,
  Share,
} from 'lucide-react';
import { formatFileSize } from '@/utils/mediaUtils';
import { getFileAction } from '@/utils/fileTypeUtils';
import { CompanyFavicon } from '@/components/CompanyFavicon';
import { useToast } from '@/hooks/use-toast';

interface MediaTableRowProps {
  item: MediaFile;
  onNavigate?: (folderName: string) => void;
  onFavorite: (filePath: string, isFavorited: boolean, event?: React.MouseEvent) => void;
  onDelete: (name: string, isFolder: boolean, bucketId?: string) => void;
  onRename?: (name: string) => void;
  onFilePreview?: (file: MediaFile) => void;
  currentPath: string;
  getUploaderDisplayName: (userId: string) => string;
  getUserProfile: (userId: string) => { first_name?: string; avatar_url?: string } | null;
}

export const MediaTableRow: React.FC<MediaTableRowProps> = ({
  item,
  onNavigate,
  onFavorite,
  onDelete,
  onRename,
  onFilePreview,
  currentPath,
  getUploaderDisplayName,
  getUserProfile,
}) => {
  const { toast } = useToast();
  
  const filePath = currentPath 
    ? `${currentPath}/${item.name}`
    : item.name;
    
  const isCompanyRootFolder = item.isCompanyFolder && !currentPath;

  const handleRowClick = () => {
    if (item.isFolder && onNavigate) {
      onNavigate(item.name);
    } else if (!item.isFolder) {
      const fileAction = getFileAction(item.fileType);
      
      if (fileAction === 'preview' && onFilePreview) {
        onFilePreview(item);
      } else if (fileAction === 'open') {
        window.open(item.url, '_blank');
      }
      // For 'none' action, do nothing
    }
  };

  const handleShareLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.url);
      toast({
        title: 'Link copied',
        description: 'File link has been copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Failed to copy link',
        description: 'Could not copy the file link to clipboard',
        variant: 'destructive',
      });
    }
  };

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
      return <FolderIcon className="h-5 w-5 text-blue-500" />;
    } else if (file.fileType.startsWith('image/')) {
      return <FileImageIcon className="h-5 w-5 text-green-500" />;
    } else if (file.fileType.startsWith('video/')) {
      return <FileVideoIcon className="h-5 w-5 text-red-500" />;
    } else {
      return <FileTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileType = (file: MediaFile) => {
    if (file.isFolder) return 'Folder';
    if (file.fileType.startsWith('image/')) return 'Image';
    if (file.fileType.startsWith('video/')) return 'Video';
    if (file.fileType.startsWith('application/pdf')) return 'PDF';
    if (file.fileType.startsWith('text/')) return 'Text';
    return 'File';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserInitials = (firstName: string) => {
    return firstName.charAt(0).toUpperCase();
  };

  const renderUploader = () => {
    // Show uploader for both files and folders now
    if (!item.uploadedBy) {
      return <span className="text-gray-400">—</span>;
    }

    const userProfile = getUserProfile(item.uploadedBy);
    const firstName = userProfile?.first_name || getUploaderDisplayName(item.uploadedBy).split(' ')[0] || 'User';
    const avatarUrl = userProfile?.avatar_url;

    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="text-xs">
            {getUserInitials(firstName)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm text-gray-600 truncate max-w-24">
          {firstName}
        </span>
      </div>
    );
  };

  return (
    <TableRow 
      className="hover:bg-gray-50 cursor-pointer border-b border-gray-100"
      onClick={handleRowClick}
    >
      <TableCell className="py-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {item.fileType.startsWith('image/') && !item.isFolder ? (
              <div className="h-8 w-8 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
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
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate" title={item.name}>
              {item.name}
            </p>
          </div>
          {item.favorited && (
            <HeartIcon className="h-4 w-4 fill-red-500 text-red-500 flex-shrink-0" />
          )}
        </div>
      </TableCell>
      
      <TableCell className="text-gray-600">
        {getFileType(item)}
      </TableCell>
      
      <TableCell className="text-gray-600">
        {item.isFolder 
          ? `${item.fileCount || 0} items`
          : formatFileSize(item.size)
        }
      </TableCell>
      
      <TableCell className="text-gray-600">
        {formatDate(item.created_at)}
      </TableCell>
      
      <TableCell>
        {renderUploader()}
      </TableCell>
      
      <TableCell>
        {!isCompanyRootFolder && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Favorite option for both files and folders */}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite(filePath, item.favorited, e);
                }}
              >
                <HeartIcon className="h-4 w-4 mr-2" />
                {item.favorited ? 'Remove from favorites' : 'Add to favorites'}
              </DropdownMenuItem>
              
              {!item.isFolder && (
                <>
                  <DropdownMenuItem onClick={handleShareLink}>
                    <Share className="h-4 w-4 mr-2" />
                    Get share link
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a 
                      href={item.url} 
                      download={item.name} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </DropdownMenuItem>
                </>
              )}
              
              {item.isFolder && onRename && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename(item.name);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.name, item.isFolder, item.bucketId);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  );
};
