
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaFile } from '@/types/media';
import { MediaGridItem } from './MediaGridItem';
import { MediaListItem } from './MediaListItem';
import { FileIcon, FolderIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CenteredSpinner } from '@/components/ui/CenteredSpinner';
import { useDroppable } from '@dnd-kit/core';

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
  onDelete: (name: string, isFolder: boolean, bucketId?: string) => void;
  onRename?: (name: string) => void;
  onUpload: () => void;
  onNewFolder: () => void;
  getUploaderDisplayName: (userId: string) => string;
  activeDragItem?: MediaFile | null;
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
  activeDragItem,
}) => {
  // Determine if we're inside a company folder (not at root)
  const isInsideCompanyFolder = activeTab === 'company' && currentPath;
  
  // Define canRename based on whether onRename function is provided
  const canRename = !!onRename;
  
  // Pre-create droppable refs for all folders to avoid conditional hook calls
  // This ensures hooks are called consistently on every render
  const droppableRefs = filteredMedia.folders.map(folder => {
    const { setNodeRef, isOver } = useDroppable({
      id: folder.id,
      data: folder, // Important: Include the folder data here
    });
    return { id: folder.id, setNodeRef, isOver };
  });
  
  // Render different content based on loading state and data availability
  if (isLoading) {
    return <CenteredSpinner />;
  }

  if (!filteredMedia.folders.length && !filteredMedia.files.length) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/30">
        <div className="mx-auto w-16 h-16 mb-4 text-muted">
          {activeTab === 'company' ? (
            <FolderIcon className="h-16 w-16 mx-auto text-muted-foreground/30" />
          ) : (
            <FileIcon className="h-16 w-16 mx-auto text-muted-foreground/30" />
          )}
        </div>
        <h3 className="text-lg font-medium mb-2">No files here yet</h3>
        <p className="text-muted-foreground mb-6">
          Upload files {(activeTab === 'internal' || currentPath) ? 'or create folders ' : ''}to get started
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={onUpload}>
            Upload Files
          </Button>
          {(activeTab === 'internal' || isInsideCompanyFolder) && (
            <Button variant="outline" onClick={onNewFolder}>
              Create Folder
            </Button>
          )}
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
              {filteredMedia.folders.map((folder, index) => {
                // Find the corresponding droppable ref
                const droppableRef = droppableRefs.find(ref => ref.id === folder.id);
                const isBeingDraggedOver = droppableRef?.isOver && activeDragItem && !activeDragItem.isFolder;
                
                return (
                  <motion.div
                    key={folder.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <div 
                      ref={droppableRef?.setNodeRef} 
                      className={`w-full h-full ${isBeingDraggedOver ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    >
                      {viewMode === 'grid' ? (
                        <MediaGridItem
                          item={folder}
                          onNavigate={onNavigate}
                          onFavorite={onFavorite}
                          onDelete={(name, isFolder) => onDelete(name, isFolder, folder.bucketId)}
                          onRename={canRename && onRename ? onRename : undefined}
                          currentPath={currentPath}
                          getUploaderDisplayName={getUploaderDisplayName}
                        />
                      ) : (
                        <MediaListItem
                          item={folder}
                          onNavigate={onNavigate}
                          onFavorite={onFavorite}
                          onDelete={(name, isFolder) => onDelete(name, isFolder, folder.bucketId)}
                          onRename={canRename && onRename ? onRename : undefined}
                          currentPath={currentPath}
                          getUploaderDisplayName={getUploaderDisplayName}
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}
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
                      onDelete={(name) => onDelete(name, false, file.bucketId)}
                      currentPath={currentPath}
                      getUploaderDisplayName={getUploaderDisplayName}
                    />
                  ) : (
                    <MediaListItem
                      item={file}
                      onFavorite={onFavorite}
                      onDelete={(name) => onDelete(name, false, file.bucketId)}
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
