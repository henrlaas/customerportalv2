
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderIcon, UploadIcon, Heart, GridIcon, ListIcon, Building } from 'lucide-react';
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
  onTabChange: (value: string) => void;
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
  onTabChange,
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
  
  // Show upload button only if:
  // - In internal files tab, OR
  // - In company files tab AND inside a company folder (currentPath exists)
  const showUploadButton = activeTab === 'internal' || (activeTab === 'company' && currentPath);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Files</h1>
      </div>

      {/* Tab Selector */}
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="internal">
            <FolderIcon className="h-4 w-4 mr-2" />
            Internal Media
          </TabsTrigger>
          <TabsTrigger value="company">
            <Building className="h-4 w-4 mr-2" />
            Company Media
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search Field */}
      <div className="flex-1">
        <Input
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Filter Controls Row */}
      <div className="flex items-center gap-4">
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
        
        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(value: ViewMode) => onViewModeChange(value)}>
          <TabsList>
            <TabsTrigger value="grid">
              <GridIcon className="h-4 w-4 mr-2" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="list">
              <ListIcon className="h-4 w-4 mr-2" />
              List
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
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

      {/* Action Buttons Row */}
      <div className="flex gap-2">
        {showFolderButton && (
          <Button 
            variant="outline"
            onClick={onNewFolder}
          >
            <FolderIcon className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        )}
        {showUploadButton && (
          <Button 
            onClick={onUpload}
          >
            <UploadIcon className="h-4 w-4 mr-2" />
            Upload
          </Button>
        )}
      </div>
    </div>
  );
};
