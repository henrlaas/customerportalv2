
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Heart, FolderIcon, UploadIcon } from 'lucide-react';
import { FilterOptions } from '@/types/media';

interface MediaToolbarProps {
  searchQuery: string;
  filters: FilterOptions;
  onSearchChange: (value: string) => void;
  onFiltersChange: (filters: FilterOptions) => void;
  onNewFolder: () => void;
  onUpload: () => void;
  showFolderButton?: boolean;
  showUploadButton?: boolean;
}

export const MediaToolbar: React.FC<MediaToolbarProps> = ({
  searchQuery,
  filters,
  onSearchChange,
  onFiltersChange,
  onNewFolder,
  onUpload,
  showFolderButton = true,
  showUploadButton = true,
}) => {
  return (
    <div className="flex flex-col gap-4 py-4 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-white border-gray-300 focus:border-primary focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={filters.favorites ? "default" : "outline"}
            size="sm"
            onClick={() => onFiltersChange({
              ...filters,
              favorites: !filters.favorites
            })}
            className={`flex items-center gap-2 ${
              filters.favorites 
                ? 'bg-red-500 hover:bg-red-600 text-white border-red-500' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Heart className={`h-4 w-4 ${filters.favorites ? 'fill-white text-white' : 'text-gray-700'}`} />
          </Button>

          {showFolderButton && (
            <Button 
              variant="outline"
              size="sm"
              onClick={onNewFolder}
              className="flex items-center gap-2"
            >
              <FolderIcon className="h-4 w-4" />
              New Folder
            </Button>
          )}
          {showUploadButton && (
            <Button 
              size="sm"
              onClick={onUpload}
              className="flex items-center gap-2"
            >
              <UploadIcon className="h-4 w-4" />
              Upload Files
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
