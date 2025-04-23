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

  const { data: mediaData, isLoading: isLoadingMedia } = useMediaData(
    currentPath,
    session,
    filters,
    activeTab
  );

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

  // File upload with react-dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setIsUploading(true);
      uploadFileMutation.mutate(acceptedFiles[0], {
        onSettled: () => setIsUploading(false)
      });
    }
  }, [uploadFileMutation, setIsUploading]);

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
    toggleFavoriteMutation.mutate({ filePath, isFavorited });
  };

  // Filter and sort the media items
  const filteredMedia = React.useMemo(() => {
    let folders = mediaData?.folders || [];
    let files = mediaData?.files || [];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      folders = folders.filter(folder => folder.name.toLowerCase().includes(query));
      files = files.filter(file => file.name.toLowerCase().includes(query));
    }

    if (activeTab === 'favorites') {
      folders = folders.filter(folder => folder.favorited);
      files = files.filter(file => file.favorited);
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
  }, [mediaData, searchQuery, sortOption, activeTab]);

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Files</h1>
        <div className="flex gap-2">
          {/* Add anomaly detection buttons */}
          {/* <Button
            variant="outline"
            onClick={handleCheckAnomalies}
            disabled={isCheckingAnomalies}
            className="mr-2"
          >
            {isCheckingAnomalies ? (
              <>
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Checking...
              </>
            ) : (
              'Check for Anomalies'
            )}
          </Button>
          {anomalousEntries.length > 0 && (
            <Button
              variant="secondary"
              onClick={handleFixAnomalies}
              className="mr-2"
            >
              Fix Anomalies ({anomalousEntries.length})
            </Button>
          )}
          
          {/* Add cleanup button */}
          {/* <Button
            variant="destructive"
            onClick={handleCleanupBucket}
            className="mr-2"
          >
            Clean Bucket
          </Button> */}
          <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-background border text-foreground px-4 py-2 rounded hover:bg-muted">
                <FolderIcon className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
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
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
                <UploadIcon className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
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
        </div>
      </div>

      
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center text-sm overflow-x-auto scrollbar-hide">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCurrentPath('')} 
            className={currentPath ? 'text-muted-foreground' : 'text-primary font-medium'}
          >
            Files
          </Button>
          
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
              <Button
                variant="ghost"
                size="sm"
                className={i === breadcrumbs.length - 1 ? 'text-primary font-medium' : 'text-muted-foreground'}
                onClick={() => navigateToBreadcrumb(i)}
              >
                {crumb}
              </Button>
            </React.Fragment>
          ))}
        </div>
        
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search files and folders..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            defaultValue="newest" 
            onValueChange={(value) => setSortOption(value as SortOption)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Date (Newest)</SelectItem>
              <SelectItem value="oldest">Date (Oldest)</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="size">Size (Smallest)</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center border rounded-md overflow-hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('grid')} 
              className={`rounded-none px-3 ${viewMode === 'grid' ? 'bg-muted' : ''}`}
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('list')} 
              className={`rounded-none px-3 ${viewMode === 'list' ? 'bg-muted' : ''}`}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      
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
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      
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
                }
              }}
              disabled={!newFolderNameForRename.trim()}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <Tabs defaultValue="all" onValueChange={setActiveTab} value={activeTab}>
        <TabsList>
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {isLoadingMedia ? (
            <CenteredSpinner />
          ) : (
            <div className="space-y-8">
              
              {filteredMedia.folders.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium mb-4">Folders</h2>
                  <div className={viewMode === 'grid' ? 
                    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" : 
                    "space-y-2"
                  }>
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
                              onNavigate={navigateToFolder}
                              onFavorite={handleFavoriteToggle}
                              onDelete={(name) => setFolderToDelete(name)}
                              onRename={(name) => {
                                setFolderToRename(name);
                                setNewFolderNameForRename(name);
                              }}
                              currentPath={currentPath}
                              getUploaderDisplayName={getUploaderDisplayName}
                            />
                          ) : (
                            <MediaListItem
                              item={folder}
                              onNavigate={navigateToFolder}
                              onFavorite={handleFavoriteToggle}
                              onDelete={(name) => setFolderToDelete(name)}
                              onRename={(name) => {
                                setFolderToRename(name);
                                setNewFolderNameForRename(name);
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
              
              
              {filteredMedia.files.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium mb-4">Files</h2>
                  <div className={viewMode === 'grid' ? 
                    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" : 
                    "space-y-2"
                  }>
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
                              onFavorite={handleFavoriteToggle}
                              onDelete={(name) => deleteFileMutation.mutate({ 
                                path: currentPath, 
                                isFolder: false, 
                                name 
                              })}
                              currentPath={currentPath}
                              getUploaderDisplayName={getUploaderDisplayName}
                            />
                          ) : (
                            <MediaListItem
                              item={file}
                              onFavorite={handleFavoriteToggle}
                              onDelete={(name) => deleteFileMutation.mutate({ 
                                path: currentPath, 
                                isFolder: false, 
                                name 
                              })}
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
              
              
              {!isLoadingMedia && filteredMedia.folders.length === 0 && filteredMedia.files.length === 0 && (
                <div className="text-center py-12 border rounded-lg bg-muted/30">
                  <div className="mx-auto w-16 h-16 mb-4 text-muted">
                    <FileIcon className="h-16 w-16 mx-auto text-muted-foreground/30" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No files here yet</h3>
                  <p className="text-muted-foreground mb-6">Upload files or create folders to get started</p>
                  <div className="flex justify-center gap-4">
                    <Button onClick={() => setIsUploadDialogOpen(true)}>
                      <UploadIcon className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                    <Button variant="outline" onClick={() => setIsFolderDialogOpen(true)}>
                      <FolderIcon className="h-4 w-4 mr-2" />
                      Create Folder
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        
        <TabsContent value="favorites" className="mt-4">
          {isLoadingMedia ? (
            <CenteredSpinner />
          ) : (
            <div className="space-y-8">
              {filteredMedia.files.length > 0 ? (
                <div className={viewMode === 'grid' ? 
                  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" : 
                  "space-y-2"
                }>
                  <AnimatePresence>
                    {filteredMedia.files.map((file) => {
                      const filePath = currentPath 
                        ? `${currentPath}/${file.name}`
                        : file.name;
                      
                      return viewMode === 'grid' ? (
                        <motion.div
                          key={file.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                          className="relative group"
                        >
                          <MediaGridItem
                            item={file}
                            onFavorite={handleFavoriteToggle}
                            onDelete={(name) => deleteFileMutation.mutate({ path: currentPath, isFolder: false, name })}
                            currentPath={currentPath}
                            getUploaderDisplayName={getUploaderDisplayName}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          key={file.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                        >
                          <MediaListItem
                            item={file}
                            onFavorite={handleFavoriteToggle}
                            onDelete={(name) => deleteFileMutation.mutate({ path: currentPath, isFolder: false, name })}
                            currentPath={currentPath}
                            getUploaderDisplayName={getUploaderDisplayName}
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-muted/30">
                  <HeartIcon className="h-16 w-16 mx-auto text-muted-foreground/30" />
                  <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
                  <p className="text-muted-foreground mb-4">Click the heart icon on any file to add it to your favorites</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediaPage;
