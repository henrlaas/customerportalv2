import React, { useState, useCallback, useMemo } from 'react';
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
import { FilterOptions, MediaFile } from '@/types/media';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { MediaHeader } from '@/components/media/MediaHeader';
import { MediaTabs } from '@/components/media/MediaTabs';
import { MediaPreviewDialog } from '@/components/media/MediaPreviewDialog';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useMediaDragAndDrop } from '@/hooks/useMediaDragAndDrop';
import { MediaGridItem } from '@/components/media/MediaGridItem';

const MediaPage: React.FC = () => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState('internal');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const { user, session } = useAuth();
  const [folderToDelete, setFolderToDelete] = useState<{name: string, isFolder: boolean, bucketId?: string} | null>(null);
  const [folderToRename, setFolderToRename] = useState<string | null>(null);
  const [newFolderNameForRename, setNewFolderNameForRename] = useState('');
  const [userNamesCache, setUserNamesCache] = React.useState<{[userId: string]: string}>({});
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const { toast } = useToast();
  
  const [filters, setFilters] = useState<FilterOptions>({
    fileTypes: [],
    dateRange: { start: null, end: null },
    favorites: false,
  });

  // Update the filters state definition to include favorites handling
  const {
    uploadFileMutation,
    createFolderMutation,
    deleteFileMutation,
    renameFolderMutation,
    toggleFavoriteMutation,
  } = useMediaOperations(currentPath, session, activeTab);

  // Setup drag and drop with proper sensors configuration
  const { 
    handleDragEnd, 
    handleDragStart, 
    isDragging,
    activeDragItem
  } = useMediaDragAndDrop(currentPath, activeTab);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Adjust this value as needed - lower makes it easier to start dragging
      },
    })
  );

  // Fetch media for the current tab
  const { data: mediaData, isLoading: isLoadingMedia } = useMediaData(
    currentPath,
    session,
    filters,
    activeTab
  );

  // Generate mock recent items - in real app this would come from tracking
  const recentItems = useMemo(() => {
    if (!mediaData) return [];
    const allItems = [...mediaData.folders, ...mediaData.files];
    return allItems.slice(0, 6).map(item => ({
      ...item,
      isRecentlyUsed: true,
      lastAccessed: new Date().toISOString()
    }));
  }, [mediaData]);

  // Navigate to folder
  const navigateToFolder = (folderName: string) => {
    // Turn off favorites filter when navigating into a folder
    if (filters.favorites) {
      setFilters(prev => ({ ...prev, favorites: false }));
    }
    setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName);
    setCurrentPage(1); // Reset to first page when navigating
  };

  // Build breadcrumb from current path
  const navigateToBreadcrumb = (index: number) => {
    if (index < 0) {
      setCurrentPath('');
    } else {
      const breadcrumbs = currentPath.split('/').filter(Boolean);
      setCurrentPath(breadcrumbs.slice(0, index + 1).join('/'));
    }
    setCurrentPage(1); // Reset to first page when navigating
  };

  // Handle tab changes and reset path
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPath('');
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  // Handle search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Add preview handlers
  const handleFilePreview = (file: MediaFile) => {
    setPreviewFile(file);
  };

  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  // Helper for rendering uploader display name with cache
  const getUploaderDisplayName = useCallback((userId: string): string => {
    if (!userId) return "Unknown";
    if (userNamesCache[userId]) return userNamesCache[userId];
    
    console.log("Fetching display name for user ID:", userId);
    
    // Fetch and cache
    supabase.rpc('get_user_display_name', { user_id: userId }).then(({ data, error }) => {
      if (!error && data && typeof data === "string") {
        console.log(`Got display name for ${userId}:`, data);
        setUserNamesCache(prev => ({ ...prev, [userId]: data }));
      } else {
        console.error("Error fetching user display name:", error);
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
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Filter, sort, and paginate media items
  const { filteredMedia, totalItems, totalPages } = React.useMemo(() => {
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
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'size':
          aValue = a.size || 0;
          bValue = b.size || 0;
          break;
        case 'modified':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'type':
          aValue = a.isFolder ? 'folder' : a.fileType;
          bValue = b.isFolder ? 'folder' : b.fileType;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    };
    
    const sortedFolders = [...folders].sort(sortItems);
    const sortedFiles = [...files].sort(sortItems);
    
    // Combine all items for pagination
    const allItems = [...sortedFolders, ...sortedFiles];
    const totalCount = allItems.length;
    const totalPagesCount = Math.ceil(totalCount / itemsPerPage);
    
    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = allItems.slice(startIndex, endIndex);
    
    // Separate paginated items back into folders and files
    const paginatedFolders = paginatedItems.filter(item => item.isFolder);
    const paginatedFiles = paginatedItems.filter(item => !item.isFolder);
    
    return {
      filteredMedia: {
        folders: paginatedFolders,
        files: paginatedFiles
      },
      totalItems: totalCount,
      totalPages: totalPagesCount
    };
  }, [mediaData, searchQuery, sortBy, sortDirection, currentPage, itemsPerPage]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Determine if we can add rename functionality
  // Allow renaming folders for internal tab or inside company folders
  const canRename = activeTab === 'internal' || (activeTab === 'company' && currentPath);
  
  // Fix: Ensure these are proper booleans
  const showFolderButton: boolean = activeTab === 'internal' || (activeTab === 'company' && !!currentPath);
  const showUploadButton: boolean = activeTab === 'internal' || (activeTab === 'company' && !!currentPath);
  
  return (
    <div className="container p-6 mx-auto">
      <DndContext 
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          <MediaHeader 
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
          
          <MediaTabs
            activeTab={activeTab}
            isLoading={isLoadingMedia}
            currentPath={currentPath}
            searchQuery={searchQuery}
            filters={filters}
            filteredMedia={filteredMedia}
            recentItems={recentItems}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onNavigate={navigateToFolder}
            onFavorite={handleFavoriteToggle}
            onDelete={handleDelete}
            onRename={canRename ? (name) => {
              setFolderToRename(name);
              setNewFolderNameForRename(name);
            } : undefined}
            onFilePreview={handleFilePreview}
            onUpload={() => setIsUploadDialogOpen(true)}
            onNewFolder={() => setIsFolderDialogOpen(true)}
            onSearchChange={handleSearchChange}
            onFiltersChange={handleFiltersChange}
            onSort={handleSort}
            getUploaderDisplayName={getUploaderDisplayName}
            onNavigateToBreadcrumb={navigateToBreadcrumb}
            showFolderButton={showFolderButton}
            showUploadButton={showUploadButton}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </div>

        <DragOverlay>
          {isDragging && activeDragItem && !activeDragItem.isFolder && (
            <div className="opacity-80 transform scale-95 w-48 pointer-events-none">
              <MediaGridItem
                item={activeDragItem}
                onFavorite={() => {}}
                onDelete={() => {}}
                currentPath={currentPath}
                getUploaderDisplayName={getUploaderDisplayName}
              />
            </div>
          )}
        </DragOverlay>
        
        {/* Media Preview Dialog */}
        <MediaPreviewDialog
          isOpen={!!previewFile}
          onClose={handleClosePreview}
          file={previewFile}
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
                disabled={!newFolderNameForRename.trim()}>
                Rename
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DndContext>
    </div>
  );
};

export default MediaPage;
