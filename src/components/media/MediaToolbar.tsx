
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SearchIcon, GridIcon, ListIcon, ChevronRight } from 'lucide-react';
import { ViewMode, SortOption } from '@/types/media';

interface MediaToolbarProps {
  currentPath: string;
  searchQuery: string;
  viewMode: ViewMode;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onNavigateToBreadcrumb: (index: number) => void;
}

export const MediaToolbar: React.FC<MediaToolbarProps> = ({
  currentPath,
  searchQuery,
  viewMode,
  onSearchChange,
  onSortChange,
  onViewModeChange,
  onNavigateToBreadcrumb,
}) => {
  const breadcrumbs = currentPath ? currentPath.split('/').filter(Boolean) : [];

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex items-center text-sm overflow-x-auto scrollbar-hide">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onNavigateToBreadcrumb(-1)} 
          className={currentPath ? 'text-muted-foreground' : 'text-primary font-medium'}
        >
          Files
        </Button>
        
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
            <Button
              variant="ghost"
              size="sm"
              className={i === breadcrumbs.length - 1 ? 'text-primary font-medium' : 'text-muted-foreground'}
              onClick={() => onNavigateToBreadcrumb(i)}
            >
              {crumb}
            </Button>
          </React.Fragment>
        ))}
      </div>
      
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search files and folders..."
          className="pl-10 w-full"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Select 
          defaultValue="newest" 
          onValueChange={(value) => onSortChange(value as SortOption)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Date (Newest)</SelectItem>
            <SelectItem value="oldest">Date (Oldest)</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="size">Size (Smallest)</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex items-center border rounded-md overflow-hidden">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onViewModeChange('grid')} 
            className={`rounded-none px-3 ${viewMode === 'grid' ? 'bg-muted' : ''}`}
          >
            <GridIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onViewModeChange('list')} 
            className={`rounded-none px-3 ${viewMode === 'list' ? 'bg-muted' : ''}`}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
