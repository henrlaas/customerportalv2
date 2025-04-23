import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  FolderIcon,
  UploadIcon,
  SearchIcon,
  GridIcon,
  ListIcon,
  FileIcon,
  HeartIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { CenteredSpinner } from '@/components/ui/CenteredSpinner';
import { MediaGridItem } from '@/components/media/MediaGridItem';
import { MediaListItem } from '@/components/media/MediaListItem';
import { useMediaOperations } from '@/hooks/useMediaOperations';
import { useMediaData } from '@/hooks/useMediaData';
import { ViewMode, SortOption, FilterOptions, MediaFile } from '@/types/media';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { cleanupMediaBucket } from '@/utils/mediaUtils';
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
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const { user, session } = useAuth();
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [folderToRename, setFolderToRename] = useState<string | null>(null);
  const [newFolderNameForRename, setNewFolderNameForRename] = useState('');
  const [userNamesCache, setUserNamesCache] = React.useState<{[userId: string]: string}>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Add state for anomalous entries
  // const [isCheckingAnomalies, setIsCheckingAnomalies] = useState(false);
  // const [anomalousEntries, setAnomalousEntries] = useState<any[]>([]);
  
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
  } = useMediaOperations(currentPath, session);

  // Fetch media for the current tab (all or companies)
  const { data: mediaData, isLoading: isLoadingMedia } = useMediaData(
    currentPath,
    session,
    filters,
    activeTab
  );

  // Special query for favorites that combines results from both buckets
  const { data: favoritesData, isLoading: isLoadingFavorites } = useQuery({
    queryKey: ['favoriteFiles', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        return { folders: [], files: [] };
      }
      
      try {
        // Get all favorites for current user
        const { data: favorites, error: favoritesError } = await supabase
          .from('media_favorites')
          .select('*')
          .eq('user_id', session.user.id);
          
        if (favoritesError) throw favoritesError;
        
        if (!favorites || favorites.length === 0) {
          return { folders: [], files: [] };
        }
        
        // Get metadata for all favorites
        const { data: mediaMetadata, error: mediaError } = await supabase
          .from('media_metadata')
          .select('*');
          
        if (mediaError) throw mediaError;
        
        // Process favorites from media bucket
        const mediaFiles: MediaFile[] = [];
        
        // Check each favorite to see which bucket it belongs to
        for (const favorite of favorites) {
          // Determine bucket and path
          const isBucketCompanies = favorite.file_path.startsWith('companies_media/');
          const bucketId = isBucketCompanies ? 'companies_media' : 'media';
          
          // Get file info
          const { data: fileData, error: fileError } = await supabase
            .storage
            .from(bucketId)
            .getPublicUrl(favorite.file_path);
            
          if (fileError || !fileData) continue;
          
          const filePathParts = favorite.file_path.split('/');
          const fileName = filePathParts[filePathParts.length - 1];
          
          const metadata = mediaMetadata?.find(meta => 
            meta.file_path === favorite.file_path
          );
          
          const fileType = getFileTypeFromName(fileName);
          
          mediaFiles.push({
            id: favorite.id,
            name: fileName,
            fileType: fileType,
            url: fileData.publicUrl,
            size: metadata?.file_size || 0,
            created_at: favorite.created_at,
            uploadedBy: metadata?.uploaded_by || 'Unknown',
            favorited: true,
            isFolder: false,
            isImage: fileType.startsWith('image/'),
            isVideo: fileType.startsWith('video/'),
            isDocument: fileType.startsWith('application/') || fileType.startsWith('text/'),
          });
        }
        
        return { folders: [], files: mediaFiles };
      } catch (error: any) {
        toast({
          title: 'Error fetching favorites',
          description: error.message,
          variant: 'destructive',
        });
        return { folders: [], files: [] };
      }
    },
    enabled: !!session?.user?.id && activeTab === 'favorites',
  });

  // Build breadcrumb from current path
  const breadcrumbs = currentPath 
    ? currentPath.split('/').filter(Boolean) 
    : [];

  // Navigate to specific path in breadcrumb
  const navigateToBreadcrumb = (index: number) => {
    if (index < 0) {
      setCurrentPath('');
    } else {
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

  // Navigate to folder
  const navigateToFolder = (folderName: string) => {
    setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName);
  };

  // Handle file upload with dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setIsUploading(true);
      uploadFileMutation.mutate(acceptedFiles[0], {
        onSettled: () => {
          setIsUploading(false);
          setIsUploadDialogOpen(false);
        }
      });
    }
  }, [uploadFileMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: false
  });

  // Create animations for grid items
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  // Handle folder creation
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolderMutation.mutate(newFolderName);
      setNewFolderName('');
      setIsFolderDialogOpen(false);
    }
  };

  // Show authentication warning if not logged in
  if (!session?.user?.id) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <div className="text-center p-12 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
          <p className="text-muted-foreground mb-4">Please log in to access the media library</p>
        </div>
      </div>
    );
  }

  // Create wrapper function to handle favorites properly
  const handleFavoriteToggle = (filePath: string, isFavorited: boolean, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    // Determine which bucket this file belongs to
    const bucketId = activeTab === 'companies' ? 'companies_media' : 'media';
    
    // For the favorites tab, the file path already includes the bucket info
    const fullPath = activeTab === 'favorites' 
      ? filePath 
      : (currentPath ? `${currentPath}/${filePath.split('/').pop()}` : filePath);
    
    toggleFavoriteMutation.mutate({ 
      filePath: fullPath, 
      isFavorited: isFavorited,
      bucketId: bucketId
    });
  };

  // Filter and sort the media items
  const filteredMedia = React.useMemo(() => {
    // For favorites tab, use the dedicated favorites data
    if (activeTab === 'favorites') {
      return favoritesData || { folders: [], files: [] };
    }
    
    let folders = mediaData?.folders || [];
    let files = mediaData?.files || [];

    // Filter out .folder files
    files = files.filter(file => file.name !== '.folder');

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      folders = folders.filter(folder => folder.name.toLowerCase().includes(query));
      files = files.filter(file => file.name.toLowerCase().includes(query));
    }
    
    const sortFiles = (a: MediaFile, b: MediaFile) => {
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
      folders: [...folders].sort(sortFiles),
      files: [...files].sort(sortFiles)
    };
  }, [mediaData, favoritesData, searchQuery, sortOption, activeTab]);

  // Add function to check for anomalous entries
  // const handleCheckAnomalies = async () => {
  //   setIsCheckingAnomalies(true);
  //   try {
  //     const { anomalies, totalItems, error } = await detectAnomalousEntries();
      
  //     if (error) {
  //       toast({
  //         title: "Error checking for anomalies",
  //         description: error,
  //         variant: "destructive",
  //       });
  //       return;
  //     }
      
  //     setAnomalousEntries(anomalies);
      
  //     if (anomalies.length === 0) {
  //       toast({
  //         title: "No anomalies found",
  //         description: `Checked ${totalItems} items in the media bucket.`,
  //       });
  //     } else {
  //       toast({
  //         title: `Found ${anomalies.length} anomalous entries`,
  //         description: "Use the 'Fix Anomalies' button to clean them up.",
  //       });
  //     }
  //   } catch (error: any) {
  //     toast({
  //       title: "Error checking for anomalies",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsCheckingAnomalies(false);
  //   }
  // };
  
  // Add function to fix anomalous entries
  // const handleFixAnomalies = async () => {
  //   if (anomalousEntries.length === 0) {
  //     toast({
  //       title: "No anomalies to fix",
  //       description: "Run 'Check for Anomalies' first.",
  //     });
  //     return;
  //   }
    
  //   try {
  //     // Fix each anomalous entry
  //     for (const entry of anomalousEntries) {
  //       await removeAnomalousEntry(entry.name);
  //     }
      
  //     toast({
  //       title: "Anomalies fixed",
  //       description: `Successfully cleaned up ${anomalousEntries.length} problematic items.`,
  //     });
      
  //     // Clear the list and refresh the media data
  //     setAnomalousEntries([]);
  //     queryClient.invalidateQueries({ queryKey: ['mediaFiles'] });
  //   } catch (error: any) {
  //     toast({
  //       title: "Error fixing anomalies",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   }
  // };

  // const handleCleanupBucket = async () => {
  //   try {
  //     await cleanupMediaBucket();
  //     toast({
  //       title: "Cleanup successful",
  //       description: "All files and folders have been removed",
  //     });
  //     // Refresh the media list
  //     queryClient.invalidateQueries({ queryKey: ['mediaFiles'] });
  //   } catch (error: any) {
  //     toast({
  //       title: "Cleanup failed",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   }
  // };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-4 py-8">
      <MediaHeader 
        onNewFolder={() => setIsFolderDialogOpen(true)}
        onUpload={() => setIsUploadDialogOpen(true)}
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
        onTabChange={setActiveTab}
        isLoading={activeTab === 'favorites' ? isLoadingFavorites : isLoadingMedia}
        viewMode={viewMode}
        currentPath={currentPath}
        filteredMedia={filteredMedia}
        onNavigate={navigateToFolder}
        onFavorite={handleFavoriteToggle}
        onDelete={(name, isFolder) => isFolder ? setFolderToDelete(name) : deleteFileMutation.mutate({ path: currentPath, isFolder: false, name })}
        onRename={(name) => {
          setFolderToRename(name);
          setNewFolderNameForRename(name);
        }}
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
              Drag and drop a file or click to select one.
            </DialogDescription>
          </DialogHeader>
          
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
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Folder Dialog */}
      <AlertDialog open={!!folderToDelete} onOpenChange={(open) => !open && setFolderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this folder? This will permanently delete the folder and all files inside it.
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
                    isFolder: true,
                    name: folderToDelete
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
