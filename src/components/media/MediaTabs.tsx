
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
  onDelete: (name: string, isFolder: boolean) => void;
  onRename?: (name: string) => void;
  onUpload: () => void;
  onNewFolder: () => void;
  getUploaderDisplayName: (userId: string) => string;
}

export const MediaTabs: React.FC<MediaTabsProps> = ({
  activeTab,
  onTabChange,
  ...contentProps
}) => {
  return (
    <Tabs defaultValue="all" onValueChange={onTabChange} value={activeTab} className="w-full">
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="all" className="flex-1 sm:flex-initial">All Files</TabsTrigger>
        <TabsTrigger value="favorites" className="flex-1 sm:flex-initial">Favorites</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-4">
        <MediaContent {...contentProps} activeTab="all" />
      </TabsContent>
      
      <TabsContent value="favorites" className="mt-4">
        <MediaContent {...contentProps} activeTab="favorites" />
      </TabsContent>
    </Tabs>
  );
};
