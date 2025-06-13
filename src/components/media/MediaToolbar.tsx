
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Heart, Grid, List } from 'lucide-react';
import { ViewMode, SortOption, FilterOptions } from '@/types/media';

interface MediaToolbarProps {
  searchQuery: string;
  viewMode: ViewMode;
  filters: FilterOptions;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onFiltersChange: (filters: FilterOptions) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export const MediaToolbar: React.FC<MediaToolbarProps> = ({
  searchQuery,
  viewMode,
  filters,
  onSearchChange,
  onSortChange,
  onFiltersChange,
  onViewModeChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between py-4 border-b border-gray-200">
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
          className="flex items-center gap-2"
        >
          <Heart className={`h-4 w-4 ${filters.favorites ? 'fill-current' : ''}`} />
          Favorites
        </Button>

        <Select
          onValueChange={(value: SortOption) => onSortChange(value)}
          defaultValue="newest"
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="size">Size</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex border border-gray-300 rounded-md">
          <Button
            variant={viewMode === 'table' ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange('table')}
            className="rounded-r-none border-0"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-l-none border-0 border-l border-gray-300"
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
