
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderIcon, UploadIcon, Heart, GridIcon, ListIcon } from 'lucide-react';
import { ViewMode, SortOption, FilterOptions } from '@/types/media';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MediaHeaderProps {
  onNewFolder: () => void;
  onUpload: () => void;
  activeTab: string;
  currentPath: string;
  searchQuery: string;
  viewMode: ViewMode;
  filters: FilterOptions;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onFiltersChange: (filters: FilterOptions) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export const MediaHeader: React.FC<MediaHeaderProps> = ({
  onNewFolder,
  onUpload,
  activeTab,
  currentPath,
  searchQuery,
  viewMode,
  filters,
  onSearchChange,
  onSortChange,
  onFiltersChange,
  onViewModeChange,
}) => {
  // Show folder creation button if:
  // - In internal files tab, OR
  // - In company files tab AND inside a company folder (currentPath exists)
  const showFolderButton = activeTab === 'internal' || (activeTab === 'company' && currentPath);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Files</h1>
        <div className="flex gap-2">
          {showFolderButton && (
            <Button 
              className="bg-background border text-foreground px-4 py-2 rounded hover:bg-muted"
              onClick={onNewFolder}
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          )}
          <Button 
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
            onClick={onUpload}
          >
            <UploadIcon className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={filters.favorites ? "default" : "outline"}
              size="icon"
              onClick={() => onFiltersChange({
                ...filters,
                favorites: !filters.favorites
              })}
              className={`${filters.favorites ? 'text-white' : ''}`}
            >
              <Heart className={`h-4 w-4 ${filters.favorites ? 'fill-current' : ''}`} />
            </Button>
            <Select
              value={viewMode}
              onValueChange={(value: ViewMode) => onViewModeChange(value)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue>
                  {viewMode === 'grid' ? 'Grid View' : 'List View'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">
                  <div className="flex items-center gap-2">
                    <GridIcon className="h-4 w-4" />
                    Grid
                  </div>
                </SelectItem>
                <SelectItem value="list">
                  <div className="flex items-center gap-2">
                    <ListIcon className="h-4 w-4" />
                    List
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value: SortOption) => onSortChange(value)}
              defaultValue="newest"
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

