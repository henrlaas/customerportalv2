
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MediaContent } from './MediaContent';
import { MediaFile } from '@/types/media';
import { ChevronRight, FolderIcon, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  onNavigateToBreadcrumb: (index: number) => void;
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
  onNavigateToBreadcrumb,
}) => {
  const breadcrumbs = currentPath 
    ? ['Root', ...currentPath.split('/')] 
    : ['Root'];

  return (
    <div className="space-y-4">
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

        <div className="flex items-center gap-2 mt-4 mb-2">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              <Button
                variant="link"
                onClick={() => onNavigateToBreadcrumb(index - 1)}
                className="p-0 h-auto text-sm hover:text-primary transition-colors"
              >
                {crumb}
              </Button>
            </React.Fragment>
          ))}
        </div>
        
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
    </div>
  );
};
