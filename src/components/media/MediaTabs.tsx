
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { MediaBreadcrumb } from './MediaBreadcrumb';
import { MediaToolbar } from './MediaToolbar';
import { MediaToolbarSkeleton } from './MediaToolbarSkeleton';
import { MediaRecentlyUsed } from './MediaRecentlyUsed';
import { MediaRecentlyUsedSkeleton } from './MediaRecentlyUsedSkeleton';
import { MediaTableView } from './MediaTableView';
import { MediaTableSkeleton } from './MediaTableSkeleton';
import { MediaFile, FilterOptions } from '@/types/media';

interface MediaTabsProps {
  activeTab: string;
  isLoading: boolean;
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
  onFilePreview?: (file: MediaFile) => void;
  onUpload: () => void;
  onNewFolder: () => void;
  onSearchChange: (value: string) => void;
  onFiltersChange: (filters: FilterOptions) => void;
  onSort?: (column: string) => void;
  getUploaderDisplayName: (userId: string) => string;
  onNavigateToBreadcrumb: (index: number) => void;
  showFolderButton: boolean;
  showUploadButton: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export const MediaTabs: React.FC<MediaTabsProps> = ({
  activeTab,
  isLoading,
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
  onFilePreview,
  onUpload,
  onNewFolder,
  onSearchChange,
  onFiltersChange,
  onSort,
  getUploaderDisplayName,
  onNavigateToBreadcrumb,
  showFolderButton,
  showUploadButton,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const allItems = [...filteredMedia.folders, ...filteredMedia.files];

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <MediaBreadcrumb 
          currentPath={currentPath}
          onNavigate={onNavigateToBreadcrumb}
        />

        <MediaToolbarSkeleton />

        <Tabs value={activeTab}>
          <TabsContent value="internal" className="mt-0">
            <div className="space-y-6">
              {!filters.favorites && <MediaRecentlyUsedSkeleton />}
              <MediaTableSkeleton />
            </div>
          </TabsContent>
          
          <TabsContent value="company" className="mt-0">
            <div className="space-y-6">
              {!filters.favorites && <MediaRecentlyUsedSkeleton />}
              <MediaTableSkeleton />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MediaBreadcrumb 
        currentPath={currentPath}
        onNavigate={onNavigateToBreadcrumb}
      />

      <MediaToolbar
        searchQuery={searchQuery}
        filters={filters}
        onSearchChange={onSearchChange}
        onFiltersChange={onFiltersChange}
        onNewFolder={onNewFolder}
        onUpload={onUpload}
        showFolderButton={showFolderButton}
        showUploadButton={showUploadButton}
      />

      <Tabs value={activeTab}>
        <TabsContent value="internal" className="mt-0">
          <div className="space-y-6">
            {!filters.favorites && (
              <MediaRecentlyUsed
                recentItems={recentItems}
                onNavigate={onNavigate}
                onFileOpen={(file) => window.open(file.url, '_blank')}
              />
            )}
            
            <MediaTableView
              items={allItems}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={onSort}
              onNavigate={onNavigate}
              onFavorite={onFavorite}
              onDelete={onDelete}
              onRename={onRename}
              onFilePreview={onFilePreview}
              currentPath={currentPath}
              getUploaderDisplayName={getUploaderDisplayName}
              isLoading={false}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="company" className="mt-0">
          <div className="space-y-6">
            {!filters.favorites && (
              <MediaRecentlyUsed
                recentItems={recentItems}
                onNavigate={onNavigate}
                onFileOpen={(file) => window.open(file.url, '_blank')}
              />
            )}
            
            <MediaTableView
              items={allItems}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={onSort}
              onNavigate={onNavigate}
              onFavorite={onFavorite}
              onDelete={onDelete}
              onRename={onRename}
              onFilePreview={onFilePreview}
              currentPath={currentPath}
              getUploaderDisplayName={getUploaderDisplayName}
              isLoading={false}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
