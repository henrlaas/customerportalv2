
import React from 'react';
import { Button } from '@/components/ui/button';
import { FolderIcon, UploadIcon } from 'lucide-react';

interface MediaHeaderProps {
  onNewFolder: () => void;
  onUpload: () => void;
  canCreateFolder?: boolean;
}

export const MediaHeader: React.FC<MediaHeaderProps> = ({
  onNewFolder,
  onUpload,
  canCreateFolder = true,
}) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Files</h1>
      <div className="flex gap-2">
        {canCreateFolder && (
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
