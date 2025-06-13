
import React from 'react';
import { MediaFile } from '@/types/media';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MediaTableRow } from './MediaTableRow';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface MediaTableViewProps {
  items: MediaFile[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  onNavigate?: (folderName: string) => void;
  onFavorite: (filePath: string, isFavorited: boolean, event?: React.MouseEvent) => void;
  onDelete: (name: string, isFolder: boolean, bucketId?: string) => void;
  onRename?: (name: string) => void;
  currentPath: string;
  getUploaderDisplayName: (userId: string) => string;
  isLoading?: boolean;
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
  currentPath,
  getUploaderDisplayName,
  isLoading,
}) => {
  const handleSort = (column: string) => {
    if (onSort) {
      onSort(column);
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No files or folders found</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b border-gray-200">
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 font-semibold text-gray-900"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-2">
                Name
                <SortIcon column="name" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 font-semibold text-gray-900"
              onClick={() => handleSort('type')}
            >
              <div className="flex items-center gap-2">
                Type
                <SortIcon column="type" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 font-semibold text-gray-900"
              onClick={() => handleSort('size')}
            >
              <div className="flex items-center gap-2">
                Size
                <SortIcon column="size" />
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-gray-50 font-semibold text-gray-900"
              onClick={() => handleSort('modified')}
            >
              <div className="flex items-center gap-2">
                Modified
                <SortIcon column="modified" />
              </div>
            </TableHead>
            <TableHead className="font-semibold text-gray-900">Uploader</TableHead>
            <TableHead className="w-24 font-semibold text-gray-900">Actions</TableHead>
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
              currentPath={currentPath}
              getUploaderDisplayName={getUploaderDisplayName}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
