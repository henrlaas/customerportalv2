
import React from 'react';
import { Button } from '@/components/ui/button';
import { FolderIcon, UploadIcon } from 'lucide-react';

interface MediaHeaderProps {
  onNewFolder: () => void;
  onUpload: () => void;
  canCreateFolder?: boolean;
  activeTab: string;
  currentPath: string;
}

export const MediaHeader: React.FC<MediaHeaderProps> = ({
  onNewFolder,
  onUpload,
  canCreateFolder = true,
  activeTab,
  currentPath,
}) => {
  // Show folder creation button if:
  // - In internal files tab, OR
  // - In company files tab AND inside a company folder (currentPath exists)
  const showFolderButton = activeTab === 'internal' || (activeTab === 'company' && currentPath);

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Files</h1>
      <div className="flex gap-2">
        {showFolderButton && (
          <Button 
            className="bg-background border text-foreground px-4 py-2 rounded hover:bg-muted"
            onClick={onNewFolder}
          >
            <FolderIcon className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        )}
        <Button 
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          onClick={onUpload}
        >
          <UploadIcon className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>
    </div>
  );
};
