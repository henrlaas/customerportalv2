
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
} from 'lucide-react';
import { formatFileSize } from '@/utils/mediaUtils';
import { CompanyFavicon } from '@/components/CompanyFavicon';

interface MediaTableRowProps {
  item: MediaFile;
  onNavigate?: (folderName: string) => void;
  onFavorite: (filePath: string, isFavorited: boolean, event?: React.MouseEvent) => void;
  onDelete: (name: string, isFolder: boolean, bucketId?: string) => void;
  onRename?: (name: string) => void;
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
  currentPath,
  getUploaderDisplayName,
  getUserProfile,
}) => {
  const filePath = item.fullPath || (currentPath 
    ? `${currentPath}/${item.name}`
    : item.name);
    
  const isCompanyRootFolder = item.isCompanyFolder && !currentPath;

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
      onClick={() => item.isFolder && onNavigate?.(item.name)}
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
          {item.favorited && !item.isFolder && (
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
        {!item.isFolder ? renderUploader() : <span className="text-gray-400">—</span>}
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
              {!item.isFolder && (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onFavorite(filePath, item.favorited, e);
                    }}
                  >
                    <HeartIcon className="h-4 w-4 mr-2" />
                    {item.favorited ? 'Remove from favorites' : 'Add to favorites'}
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
