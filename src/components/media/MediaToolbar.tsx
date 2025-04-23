
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ListIcon, GridIcon, ChevronRightIcon, Heart } from 'lucide-react';
import { ViewMode, SortOption, FilterOptions } from '@/types/media';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MediaToolbarProps {
  currentPath: string;
  searchQuery: string;
  viewMode: ViewMode;
  filters: FilterOptions;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onFiltersChange: (filters: FilterOptions) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onNavigateToBreadcrumb: (index: number) => void;
}

export const MediaToolbar: React.FC<MediaToolbarProps> = ({
  currentPath,
  searchQuery,
  viewMode,
  filters,
  onSearchChange,
  onSortChange,
  onFiltersChange,
  onViewModeChange,
  onNavigateToBreadcrumb,
}) => {
  const breadcrumbs = currentPath 
    ? ['Root', ...currentPath.split('/')] 
    : ['Root'];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />}
                <button
                  onClick={() => onNavigateToBreadcrumb(index - 1)}
                  className="text-sm hover:text-primary transition-colors"
                >
                  {crumb}
                </button>
              </React.Fragment>
            ))}
          </div>
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
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>
    </div>
  );
};
