import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { MediaTableRow } from './MediaTableRow';
import { MediaPagination } from './MediaPagination';
import { MediaFile } from '@/types/media';
import { useUserProfiles } from '@/hooks/useUserProfiles';

interface MediaTableViewProps {
  items: MediaFile[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  onNavigate: (folderName: string) => void;
  onFavorite: (filePath: string, isFavorited: boolean, event?: React.MouseEvent) => void;
  onDelete: (name: string, isFolder: boolean, bucketId?: string) => void;
  onRename?: (name: string) => void;
  onFilePreview?: (file: MediaFile) => void;
  currentPath: string;
  getUploaderDisplayName: (userId: string) => string;
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export const MediaTableView: React.FC<MediaTableViewProps> = ({
  items,
  sortBy,
  sortDirection,
  onSort,
  onNavigate,
  onFavorite,
  onDelete,
  onRename,
  onFilePreview,
  currentPath,
  getUploaderDisplayName,
  isLoading,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 20,
  onPageChange,
}) => {
  // Get unique uploader IDs for fetching profiles
  const uploaderIds = React.useMemo(() => {
    const ids = items
      .filter(item => !item.isFolder && item.uploadedBy)
      .map(item => item.uploadedBy!)
      .filter((id, index, arr) => arr.indexOf(id) === index); // Remove duplicates
    return ids;
  }, [items]);

  const { data: userProfiles = {} } = useUserProfiles(uploaderIds);

  const getUserProfile = (userId: string) => {
    return userProfiles[userId] || null;
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  if (totalItems === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p className="text-lg font-medium">No files found</p>
          <p className="text-sm">Upload files or change your search criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 bg-gray-50">
            <TableHead className="font-semibold text-gray-900">
              <Button
                variant="ghost"
                onClick={() => onSort?.('name')}
                className="h-auto p-0 font-semibold text-gray-900 hover:text-primary"
              >
                Name
                {getSortIcon('name')}
              </Button>
            </TableHead>
            <TableHead className="font-semibold text-gray-900">
              <Button
                variant="ghost"
                onClick={() => onSort?.('type')}
                className="h-auto p-0 font-semibold text-gray-900 hover:text-primary"
              >
                Type
                {getSortIcon('type')}
              </Button>
            </TableHead>
            <TableHead className="font-semibold text-gray-900">
              <Button
                variant="ghost"
                onClick={() => onSort?.('size')}
                className="h-auto p-0 font-semibold text-gray-900 hover:text-primary"
              >
                Size
                {getSortIcon('size')}
              </Button>
            </TableHead>
            <TableHead className="font-semibold text-gray-900">
              <Button
                variant="ghost"
                onClick={() => onSort?.('modified')}
                className="h-auto p-0 font-semibold text-gray-900 hover:text-primary"
              >
                Modified
                {getSortIcon('modified')}
              </Button>
            </TableHead>
            <TableHead className="font-semibold text-gray-900">Uploaded by</TableHead>
            <TableHead className="font-semibold text-gray-900 w-16">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <MediaTableRow
              key={item.id}
              item={item}
              onNavigate={onNavigate}
              onFavorite={onFavorite}
              onDelete={onDelete}
              onRename={onRename}
              onFilePreview={onFilePreview}
              currentPath={currentPath}
              getUploaderDisplayName={getUploaderDisplayName}
              getUserProfile={getUserProfile}
            />
          ))}
        </TableBody>
      </Table>
      
      {onPageChange && (
        <MediaPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};
