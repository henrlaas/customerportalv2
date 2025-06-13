
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { MediaBreadcrumb } from './MediaBreadcrumb';
import { MediaToolbar } from './MediaToolbar';
import { MediaRecentlyUsed } from './MediaRecentlyUsed';
import { MediaTableView } from './MediaTableView';
import { MediaContent } from './MediaContent';
import { MediaFile, ViewMode, SortOption, FilterOptions } from '@/types/media';

interface MediaTabsProps {
  activeTab: string;
  isLoading: boolean;
  viewMode: ViewMode;
  currentPath: string;
  searchQuery: string;
  filters: FilterOptions;
  filteredMedia: {
    folders: MediaFile[];
    files: MediaFile[];
  };
  recentItems: MediaFile[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onNavigate: (folderName: string) => void;
  onFavorite: (filePath: string, isFavorited: boolean, event?: React.MouseEvent) => void;
  onDelete: (name: string, isFolder: boolean, bucketId?: string) => void;
  onRename?: (name: string) => void;
  onUpload: () => void;
  onNewFolder: () => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onFiltersChange: (filters: FilterOptions) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onSort?: (column: string) => void;
  getUploaderDisplayName: (userId: string) => string;
  onNavigateToBreadcrumb: (index: number) => void;
  showFolderButton: boolean;
  showUploadButton: boolean;
}

export const MediaTabs: React.FC<MediaTabsProps> = ({
  activeTab,
  isLoading,
  viewMode,
  currentPath,
  searchQuery,
  filters,
  filteredMedia,
  recentItems,
  sortBy,
  sortDirection,
  onNavigate,
  onFavorite,
  onDelete,
  onRename,
  onUpload,
  onNewFolder,
  onSearchChange,
  onSortChange,
  onFiltersChange,
  onViewModeChange,
  onSort,
  getUploaderDisplayName,
  onNavigateToBreadcrumb,
  showFolderButton,
  showUploadButton,
}) => {
  const allItems = [...filteredMedia.folders, ...filteredMedia.files];

  return (
    <div className="space-y-6">
      <MediaBreadcrumb 
        currentPath={currentPath}
        onNavigate={onNavigateToBreadcrumb}
      />

      <MediaToolbar
        searchQuery={searchQuery}
        viewMode={viewMode}
        filters={filters}
        onSearchChange={onSearchChange}
        onSortChange={onSortChange}
        onFiltersChange={onFiltersChange}
        onViewModeChange={onViewModeChange}
        onNewFolder={onNewFolder}
        onUpload={onUpload}
        showFolderButton={showFolderButton}
        showUploadButton={showUploadButton}
      />

      <Tabs value={activeTab}>
        <TabsContent value="internal" className="mt-0">
          <div className="space-y-6">
            <MediaRecentlyUsed
              recentItems={recentItems}
              onNavigate={onNavigate}
              onFileOpen={(file) => window.open(file.url, '_blank')}
            />
            
            {viewMode === 'table' ? (
              <MediaTableView
                items={allItems}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
                onNavigate={onNavigate}
                onFavorite={onFavorite}
                onDelete={onDelete}
                onRename={onRename}
                currentPath={currentPath}
                getUploaderDisplayName={getUploaderDisplayName}
                isLoading={isLoading}
              />
            ) : (
              <MediaContent
                isLoading={isLoading}
                viewMode={viewMode}
                currentPath={currentPath}
                filteredMedia={filteredMedia}
                activeTab="internal"
                onNavigate={onNavigate}
                onFavorite={onFavorite}
                onDelete={onDelete}
                onRename={onRename}
                onUpload={onUpload}
                onNewFolder={onNewFolder}
                getUploaderDisplayName={getUploaderDisplayName}
              />
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="company" className="mt-0">
          <div className="space-y-6">
            <MediaRecentlyUsed
              recentItems={recentItems}
              onNavigate={onNavigate}
              onFileOpen={(file) => window.open(file.url, '_blank')}
            />
            
            {viewMode === 'table' ? (
              <MediaTableView
                items={allItems}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={onSort}
                onNavigate={onNavigate}
                onFavorite={onFavorite}
                onDelete={onDelete}
                onRename={onRename}
                currentPath={currentPath}
                getUploaderDisplayName={getUploaderDisplayName}
                isLoading={isLoading}
              />
            ) : (
              <MediaContent
                isLoading={isLoading}
                viewMode={viewMode}
                currentPath={currentPath}
                filteredMedia={filteredMedia}
                activeTab="company"
                onNavigate={onNavigate}
                onFavorite={onFavorite}
                onDelete={onDelete}
                onRename={onRename}
                onUpload={onUpload}
                onNewFolder={onNewFolder}
                getUploaderDisplayName={getUploaderDisplayName}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
