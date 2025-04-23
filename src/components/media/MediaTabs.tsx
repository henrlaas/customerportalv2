
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MediaContent } from './MediaContent';
import { MediaFile } from '@/types/media';

interface MediaTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  isLoading: boolean;
  viewMode: 'grid' | 'list';
  currentPath: string;
  filteredMedia: {
    folders: MediaFile[];
    files: MediaFile[];
  };
  onNavigate: (folderName: string) => void;
  onFavorite: (filePath: string, isFavorited: boolean, event?: React.MouseEvent) => void;
  onDelete: (name: string, isFolder: boolean, bucketId?: string) => void;
  onRename?: (name: string) => void;
  onUpload: () => void;
  onNewFolder: () => void;
  getUploaderDisplayName: (userId: string) => string;
  activeDragItem?: MediaFile | null;
}

export const MediaTabs: React.FC<MediaTabsProps> = ({
  activeTab,
  onTabChange,
  isLoading,
  viewMode,
  currentPath,
  filteredMedia,
  onNavigate,
  onFavorite,
  onDelete,
  onRename,
  onUpload,
  onNewFolder,
  getUploaderDisplayName,
  activeDragItem,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
        <TabsTrigger value="internal">Internal Media</TabsTrigger>
        <TabsTrigger value="company">Company Media</TabsTrigger>
      </TabsList>
      
      <TabsContent value="internal" className="mt-2">
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
          activeDragItem={activeDragItem}
        />
      </TabsContent>
      
      <TabsContent value="company" className="mt-2">
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
          activeDragItem={activeDragItem}
        />
      </TabsContent>
    </Tabs>
  );
};
