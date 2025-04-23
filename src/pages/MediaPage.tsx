import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMediaOperations } from '@/hooks/useMediaOperations';
import { useMediaData } from '@/hooks/useMediaData';
import { ViewMode, SortOption, FilterOptions } from '@/types/media';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { MediaHeader } from '@/components/media/MediaHeader';
import { MediaToolbar } from '@/components/media/MediaToolbar';
import { MediaTabs } from '@/components/media/MediaTabs';

const MediaPage: React.FC = () => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [activeTab, setActiveTab] = useState('internal');
  const { user, session } = useAuth();
  const [folderToDelete, setFolderToDelete] = useState<{name: string, isFolder: boolean, bucketId?: string} | null>(null);
  const [folderToRename, setFolderToRename] = useState<string | null>(null);
  const [newFolderNameForRename, setNewFolderNameForRename] = useState('');
  const [userNamesCache, setUserNamesCache] = React.useState<{[userId: string]: string}>({});
  const { toast } = useToast();
  
  // Set up filter state
  const [filters, setFilters] = useState<FilterOptions>({
    fileTypes: [],
    dateRange: { start: null, end: null },
    favorites: false,
  });

  const {
    uploadFileMutation,
    createFolderMutation,
    deleteFileMutation,
    renameFolderMutation,
    toggleFavoriteMutation,
  } = useMediaOperations(currentPath, session, activeTab);

  // Fetch media for the current tab
  const { data: mediaData, isLoading: isLoadingMedia } = useMediaData(
    currentPath,
    session,
    filters,
    activeTab
  );

  // Navigate to folder
  const navigateToFolder = (folderName: string) => {
    setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName);
  };

  // Build breadcrumb from current path
  const navigateToBreadcrumb = (index: number) => {
    if (index < 0) {
      setCurrentPath('');
    } else {
      const breadcrumbs = currentPath.split('/').filter(Boolean);
      setCurrentPath(breadcrumbs.slice(0, index + 1).join('/'));
    }
  };

  // Helper for rendering uploader display name with cache
  const getUploaderDisplayName = useCallback((userId: string): string => {
    if (!userId) return "Unknown";
    if (userNamesCache[userId]) return userNamesCache[userId];
    // Fetch and cache
    supabase.rpc('get_user_display_name', { user_id: userId }).then(({ data, error }) => {
      if (!error && data && typeof data === "string") {
        setUserNamesCache(prev => ({ ...prev, [userId]: data }));
      }
    });
    return `User ${userId.substring(0, 8)}`;
  }, [userNamesCache]);

  // Configuring dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        // For company media, ensure we're in a company folder
        if (activeTab === 'company' && !currentPath) {
          toast({
            title: 'Upload failed',
            description: 'Please navigate into a company folder before uploading files',
            variant: 'destructive',
          });
          return;
        }

        setIsUploading(true);
        uploadFileMutation.mutate(acceptedFiles[0], {
          onSettled: () => {
            setIsUploading(false);
            setIsUploadDialogOpen(false);
          }
        });
      }
    },
    maxFiles: 1
  });

  // Handle folder creation
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolderMutation.mutate(newFolderName);
      setNewFolderName('');
      setIsFolderDialogOpen(false);
    }
  };

  // Create wrapper function to handle favorites properly
  const handleFavoriteToggle = (filePath: string, isFavorited: boolean, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    const bucketId = activeTab === 'company' ? 'companymedia' : 'media';
    
    // Get full path for the file
    const fullPath = currentPath 
      ? `${currentPath}/${filePath.split('/').pop()}` 
      : filePath;
    
    toggleFavoriteMutation.mutate({ 
      filePath: fullPath, 
      isFavorited: isFavorited,
      bucketId: bucketId
    });
  };

  // Handle delete (file or folder)
  const handleDelete = (name: string, isFolder: boolean, bucketId?: string) => {
    setFolderToDelete({
      name,
      isFolder,
      bucketId: bucketId || (activeTab === 'company' ? 'companymedia' : 'media')
    });
  };

  // Filter and sort the media items
  const filteredMedia = React.useMemo(() => {
    let folders = mediaData?.folders || [];
    let files = mediaData?.files || [];

    // Apply search filter if provided
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      folders = folders.filter(folder => folder.name.toLowerCase().includes(query));
      files = files.filter(file => file.name.toLowerCase().includes(query));
    }
    
    // Apply sorting
    const sortItems = (a: any, b: any) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return a.size - b.size;
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    };
    
    return {
      folders: [...folders].sort(sortItems),
      files: [...files].sort(sortItems)
    };
  }, [mediaData, searchQuery, sortOption]);

  // Determine if we can add rename functionality
  // Allow renaming folders for internal tab or inside company folders
  const canRename = activeTab === 'internal' || (activeTab === 'company' && currentPath);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-4 py-8">
      <MediaHeader 
        onNewFolder={() => setIsFolderDialogOpen(true)}
        onUpload={() => setIsUploadDialogOpen(true)}
        activeTab={activeTab}
        currentPath={currentPath}
      />
      
      <MediaToolbar
        currentPath={currentPath}
        searchQuery={searchQuery}
        viewMode={viewMode}
        onSearchChange={setSearchQuery}
        onSortChange={setSortOption}
        onViewModeChange={setViewMode}
        onNavigateToBreadcrumb={navigateToBreadcrumb}
      />

      <MediaTabs
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPath(''); // Reset path when changing tabs
        }}
        isLoading={isLoadingMedia}
        viewMode={viewMode}
        currentPath={currentPath}
        filteredMedia={filteredMedia}
        onNavigate={navigateToFolder}
        onFavorite={handleFavoriteToggle}
        onDelete={handleDelete}
        onRename={canRename ? (name) => {
          setFolderToRename(name);
          setNewFolderNameForRename(name);
        } : undefined}
        onUpload={() => setIsUploadDialogOpen(true)}
        onNewFolder={() => setIsFolderDialogOpen(true)}
        getUploaderDisplayName={getUploaderDisplayName}
      />
      
      {/* Create Folder Dialog */}
      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder.
            </DialogDescription>
          </DialogHeader>
          
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="mt-2"
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              {activeTab === 'company' && !currentPath 
                ? 'Please select a company folder first before uploading files'
                : 'Drag and drop a file or click to select one.'}
            </DialogDescription>
          </DialogHeader>
          
          {activeTab === 'company' && !currentPath ? (
            <div className="text-center py-4">
              <p className="text-amber-500">You must navigate into a company folder before uploading files.</p>
              <Button 
                className="mt-4" 
                variant="outline" 
                onClick={() => setIsUploadDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          ) : (
            <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-primary font-medium">Drop the file here...</p>
              ) : (
                <div>
                  <UploadIcon className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                  <p>Drag and drop a file here, or click to select a file</p>
                  <p className="text-xs text-gray-500 mt-2">
                    All file types are supported
                  </p>
                </div>
              )}
              {isUploading && (
                <div className="mt-4 flex justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <AlertDialog open={!!folderToDelete} onOpenChange={(open) => !open && setFolderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {folderToDelete?.isFolder ? 'Folder' : 'File'}</AlertDialogTitle>
            <AlertDialogDescription>
              {folderToDelete?.isFolder 
                ? 'Are you sure you want to delete this folder? This will permanently delete the folder and all files inside it.'
                : 'Are you sure you want to delete this file?'} 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (folderToDelete) {
                  deleteFileMutation.mutate({
                    path: currentPath,
                    isFolder: folderToDelete.isFolder,
                    name: folderToDelete.name,
                    bucketId: folderToDelete.bucketId
                  });
                  setFolderToDelete(null);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Rename Folder Dialog */}
      <Dialog open={!!folderToRename} onOpenChange={(open) => !open && setFolderToRename(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>
              Enter a new name for the folder.
            </DialogDescription>
          </DialogHeader>
          
          <Input
            placeholder="New folder name"
            value={newFolderNameForRename}
            onChange={(e) => setNewFolderNameForRename(e.target.value)}
            className="mt-2"
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderToRename(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (folderToRename && newFolderNameForRename) {
                  const oldPath = currentPath 
                    ? `${currentPath}/${folderToRename}`
                    : folderToRename;
                  renameFolderMutation.mutate({
                    oldPath,
                    newName: newFolderNameForRename
                  });
                  setFolderToRename(null);
                }
              }}
              disabled={!newFolderNameForRename.trim()}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaPage;
