
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaFile } from '@/types/media';
import { MediaGridItem } from './MediaGridItem';
import { MediaListItem } from './MediaListItem';
import { FileIcon, HeartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CenteredSpinner } from '@/components/ui/CenteredSpinner';

interface MediaContentProps {
  isLoading: boolean;
  viewMode: 'grid' | 'list';
  currentPath: string;
  filteredMedia: {
    folders: MediaFile[];
    files: MediaFile[];
  };
  activeTab: string;
  onNavigate: (folderName: string) => void;
  onFavorite: (filePath: string, isFavorited: boolean, event?: React.MouseEvent) => void;
  onDelete: (name: string, isFolder: boolean) => void;
  onRename?: (name: string) => void;
  onUpload: () => void;
  onNewFolder: () => void;
  getUploaderDisplayName: (userId: string) => string;
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3 }
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export const MediaContent: React.FC<MediaContentProps> = ({
  isLoading,
  viewMode,
  currentPath,
  filteredMedia,
  activeTab,
  onNavigate,
  onFavorite,
  onDelete,
  onRename,
  onUpload,
  onNewFolder,
  getUploaderDisplayName,
}) => {
  if (isLoading) {
    return <CenteredSpinner />;
  }

  if (activeTab === 'favorites' && filteredMedia.files.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/30">
        <HeartIcon className="h-16 w-16 mx-auto text-muted-foreground/30" />
        <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
        <p className="text-muted-foreground mb-4">Click the heart icon on any file to add it to your favorites</p>
      </div>
    );
  }

  if (!isLoading && filteredMedia.folders.length === 0 && filteredMedia.files.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/30">
        <div className="mx-auto w-16 h-16 mb-4 text-muted">
          <FileIcon className="h-16 w-16 mx-auto text-muted-foreground/30" />
        </div>
        <h3 className="text-lg font-medium mb-2">No files here yet</h3>
        <p className="text-muted-foreground mb-6">Upload files or create folders to get started</p>
        <div className="flex justify-center gap-4">
          <Button onClick={onUpload}>
            Upload Files
          </Button>
          <Button variant="outline" onClick={onNewFolder}>
            Create Folder
          </Button>
        </div>
      </div>
    );
  }

  const gridContainerClass = viewMode === 'grid' 
    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" 
    : "space-y-2";

  return (
    <div className="space-y-8">
      {filteredMedia.folders.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4">Folders</h2>
          <div className={gridContainerClass}>
            <AnimatePresence>
              {filteredMedia.folders.map((folder) => (
                <motion.div
                  key={folder.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  {viewMode === 'grid' ? (
                    <MediaGridItem
                      item={folder}
                      onNavigate={onNavigate}
                      onFavorite={onFavorite}
                      onDelete={onDelete}
                      onRename={onRename}
                      currentPath={currentPath}
                      getUploaderDisplayName={getUploaderDisplayName}
                    />
                  ) : (
                    <MediaListItem
                      item={folder}
                      onNavigate={onNavigate}
                      onFavorite={onFavorite}
                      onDelete={onDelete}
                      onRename={onRename}
                      currentPath={currentPath}
                      getUploaderDisplayName={getUploaderDisplayName}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      
      {filteredMedia.files.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4">Files</h2>
          <div className={gridContainerClass}>
            <AnimatePresence>
              {filteredMedia.files.map((file) => (
                <motion.div
                  key={file.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  {viewMode === 'grid' ? (
                    <MediaGridItem
                      item={file}
                      onFavorite={onFavorite}
                      onDelete={(name) => {
                        // Don't allow deletion from favorites tab - it should just remove from favorites
                        if (activeTab === 'favorites') {
                          onFavorite(file.name, true);
                        } else {
                          onDelete(name, false);
                        }
                      }}
                      currentPath={currentPath}
                      getUploaderDisplayName={getUploaderDisplayName}
                    />
                  ) : (
                    <MediaListItem
                      item={file}
                      onFavorite={onFavorite}
                      onDelete={(name) => {
                        // Don't allow deletion from favorites tab - it should just remove from favorites
                        if (activeTab === 'favorites') {
                          onFavorite(file.name, true);
                        } else {
                          onDelete(name, false);
                        }
                      }}
                      currentPath={currentPath}
                      getUploaderDisplayName={getUploaderDisplayName}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};
