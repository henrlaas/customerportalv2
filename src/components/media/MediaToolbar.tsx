
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, GridIcon, ListIcon, SearchIcon } from 'lucide-react';
import { ViewMode, SortOption } from '@/types/media';

interface MediaToolbarProps {
  searchQuery: string;
  viewMode: ViewMode;
  currentPath: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onNavigateToBreadcrumb: (index: number) => void;
}

export const MediaToolbar: React.FC<MediaToolbarProps> = ({
  searchQuery,
  viewMode,
  currentPath,
  onSearchChange,
  onSortChange,
  onViewModeChange,
  onNavigateToBreadcrumb,
}) => {
  // Build breadcrumbs from currentPath
  const breadcrumbs = currentPath 
    ? currentPath.split('/').filter(Boolean) 
    : [];

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        {/* Breadcrumbs */}
        <div className="flex items-center overflow-x-auto whitespace-nowrap">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground px-2"
            onClick={() => onNavigateToBreadcrumb(-1)}
          >
            Home
          </Button>
          
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground px-2"
                onClick={() => onNavigateToBreadcrumb(index)}
              >
                {crumb}
              </Button>
            </React.Fragment>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={viewMode === 'grid' ? 'bg-muted' : ''}
            onClick={() => onViewModeChange('grid')}
          >
            <GridIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={viewMode === 'list' ? 'bg-muted' : ''}
            onClick={() => onViewModeChange('list')}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
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
  );
};
