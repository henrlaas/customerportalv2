
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderIcon, UploadIcon, Building } from 'lucide-react';

interface MediaHeaderProps {
  onNewFolder: () => void;
  onUpload: () => void;
  activeTab: string;
  onTabChange: (value: string) => void;
  currentPath: string;
  showFolderButton?: boolean;
  showUploadButton?: boolean;
}

export const MediaHeader: React.FC<MediaHeaderProps> = ({
  onNewFolder,
  onUpload,
  activeTab,
  onTabChange,
  currentPath,
  showFolderButton = true,
  showUploadButton = true,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">Manage and organize your files</p>
        </div>
        
        <div className="flex gap-3">
          {showFolderButton && (
            <Button 
              variant="outline"
              onClick={onNewFolder}
              className="flex items-center gap-2"
            >
              <FolderIcon className="h-4 w-4" />
              New Folder
            </Button>
          )}
          {showUploadButton && (
            <Button 
              onClick={onUpload}
              className="flex items-center gap-2"
            >
              <UploadIcon className="h-4 w-4" />
              Upload Files
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="internal" className="flex items-center gap-2">
            <FolderIcon className="h-4 w-4" />
            Internal Media
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Company Media
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
