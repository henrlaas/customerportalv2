
import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FolderIcon, 
  UploadIcon, 
  SearchIcon, 
  HeartIcon, 
  GridIcon, 
  ListIcon,
  PlusIcon,
  ChevronDown,
  FileIcon,
  FileTextIcon,
  FileImageIcon,
  FileVideoIcon,
  ChevronRight
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/contexts/AuthContext';
import { CenteredSpinner } from '@/components/ui/CenteredSpinner';
import { AnimatePresence, motion } from 'framer-motion';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Define media file type
interface MediaFile {
  id: string;
  name: string;
  fileType: string;
  url: string;
  size: number;
  created_at: string;
  uploadedBy?: string; 
  favorited: boolean;
  selected?: boolean;
  isFolder: boolean;
  isImage?: boolean;
  isVideo?: boolean;
  isDocument?: boolean;
}

// Define media data structure
interface MediaData {
  folders: MediaFile[];
  files: MediaFile[];
}

// Define view modes
type ViewMode = 'grid' | 'list';

// Define sort options
type SortOption = 'newest' | 'oldest' | 'name' | 'size';

// Define filter options
interface FilterOptions {
  fileTypes: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  favorites: boolean;
}

const MediaPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
  
  // Set up filter state
  const [filters, setFilters] = useState<FilterOptions>({
    fileTypes: [],
    dateRange: { start: null, end: null },
    favorites: false,
  });

  // Check authentication status
  useEffect(() => {
    if (!session) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to access media files',
        variant: 'destructive',
      });
    }
  }, [session, toast]);

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

  // Fetch media files from Supabase storage
  const { data: mediaData = { folders: [], files: [] }, isLoading: isLoadingMedia } = useQuery({
    queryKey: ['mediaFiles', currentPath, session?.user?.id, filters, activeTab],
    queryFn: async () => {
      if (!session?.user?.id) {
        return { folders: [], files: [] };
      }
      
      try {
        // First get folders
        const { data: folders, error: folderError } = await supabase
          .storage
          .from('media')
          .list(currentPath, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
          });
        
        if (folderError) throw folderError;

        // Then get files from media_metadata for additional metadata
        const { data: mediaMetadata, error: mediaError } = await supabase
          .from('media_metadata')
          .select('*');
          
        if (mediaError) throw mediaError;
        
        // Get favorites for the current user
        const { data: favorites, error: favoritesError } = await supabase
          .from('media_favorites')
          .select('*')
          .eq('user_id', session.user.id);
          
        if (favoritesError) throw favoritesError;
        
        // Process folders first
        const folderItems: MediaFile[] = folders
          ?.filter(item => item.id === null) // Folders have id === null
          .map(folder => ({
            id: folder.name,
            name: folder.name,
            fileType: 'folder',
            url: '',
            size: 0,
            created_at: folder.created_at || new Date().toISOString(),
            favorited: false,
            isFolder: true,
          })) || [];
          
        // Process files with their metadata
        const fileItems: MediaFile[] = folders
          ?.filter(item => item.id !== null) // Files have id !== null
          .map(file => {
            // Find matching metadata if available
            const metadata = mediaMetadata?.find(meta => 
              meta.file_path === (currentPath ? `${currentPath}/${file.name}` : file.name)
            );
            
            // Find if file is favorited
            const isFavorited = favorites?.some(fav => 
              fav.file_path === (currentPath ? `${currentPath}/${file.name}` : file.name)
            ) || false;
            
            // Build the complete URL
            const url = supabase.storage.from('media').getPublicUrl(
              currentPath ? `${currentPath}/${file.name}` : file.name
            ).data.publicUrl;
            
            // Determine file type
            const fileType = file.metadata?.mimetype || getFileTypeFromName(file.name);
            
            return {
              id: file.id || '',
              name: file.name,
              fileType: fileType,
              url: url,
              size: file.metadata?.size || 0,
              created_at: file.created_at || new Date().toISOString(),
              uploadedBy: metadata?.uploaded_by ? getUserDisplayName(metadata.uploaded_by) : 'Unknown',
              favorited: isFavorited,
              isFolder: false,
              isImage: fileType.startsWith('image/'),
              isVideo: fileType.startsWith('video/'),
              isDocument: fileType.startsWith('application/') || fileType.startsWith('text/'),
            };
          }) || [];
        
        return { folders: folderItems, files: fileItems } as MediaData;
      } catch (error: any) {
        toast({
          title: 'Error fetching media',
          description: error.message,
          variant: 'destructive',
        });
        return { folders: [], files: [] };
      }
    },
    enabled: !!session?.user?.id, // Only run query if user is authenticated
  });

  // Helper function to get display name temporarily - will be replaced by backend function
  const getUserDisplayName = (userId: string): string => {
    // This would typically call the function we created in the database
    // For now just return a placeholder
    return `User ${userId.substring(0, 8)}`;
  };
  
  // Function to infer file type from name
  const getFileTypeFromName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      return 'image/'+extension;
    } else if (['mp4', 'webm', 'mov', 'avi'].includes(extension)) {
      return 'video/'+extension;
    } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) {
      return 'application/'+extension;
    } else {
      return 'application/octet-stream';
    }
  };

  // Get file icon based on type
  const getFileIcon = (file: MediaFile) => {
    if (file.isFolder) {
      return <FolderIcon className="h-12 w-12 mb-2 text-blue-400" />;
    } else if (file.fileType.startsWith('image/')) {
      return <FileImageIcon className="h-12 w-12 mb-2 text-green-500" />;
    } else if (file.fileType.startsWith('video/')) {
      return <FileVideoIcon className="h-12 w-12 mb-2 text-red-500" />;
    } else {
      return <FileTextIcon className="h-12 w-12 mb-2 text-gray-500" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!session?.user?.id) {
        throw new Error('You must be logged in to upload files');
      }
      
      try {
        setIsUploading(true);
        
        // Define the file path
        const filePath = currentPath 
          ? `${currentPath}/${file.name}`
          : file.name;
        
        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('media')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('media')
          .getPublicUrl(filePath);
          
        // Create metadata record
        const { error: metadataError } = await supabase
          .from('media_metadata')
          .insert({
            file_path: filePath,
            uploaded_by: session.user.id,
            file_size: file.size,
            mime_type: file.type,
            original_name: file.name
          });
          
        if (metadataError) throw metadataError;
        
        return { path: uploadData?.path };
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: 'File uploaded',
        description: 'Your file has been uploaded successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['mediaFiles', currentPath] });
      setIsUploadDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (folderName: string) => {
      if (!session?.user?.id) {
        throw new Error('You must be logged in to create folders');
      }
      
      if (!folderName.trim()) {
        throw new Error('Folder name cannot be empty');
      }
      
      // Create an empty file to represent the folder
      const folderPath = currentPath
        ? `${currentPath}/${folderName}/.folder` 
        : `${folderName}/.folder`;
      
      const { error } = await supabase
        .storage
        .from('media')
        .upload(folderPath, new Blob([''], { type: 'text/plain' }), {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) throw error;
      
      return { folderName };
    },
    onSuccess: () => {
      toast({
        title: 'Folder created',
        description: 'Your folder has been created successfully',
      });
      setNewFolderName('');
      setIsFolderDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['mediaFiles', currentPath] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create folder',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async ({ path, isFolder, name }: { path: string, isFolder: boolean, name: string }) => {
      if (!session?.user?.id) {
        throw new Error('You must be logged in to delete files');
      }
      
      if (isFolder) {
        // For folders, we need to list and delete all contents
        const folderPath = currentPath 
          ? `${currentPath}/${name}`
          : name;
          
        // List all files in the folder
        const { data: folderContents, error: listError } = await supabase
          .storage
          .from('media')
          .list(folderPath);
          
        if (listError) throw listError;
        
        // Delete each file in the folder
        for (const item of folderContents || []) {
          const itemPath = `${folderPath}/${item.name}`;
          
          // Also delete any metadata
          await supabase
            .from('media_metadata')
            .delete()
            .eq('file_path', itemPath);
          
          // Delete any favorites
          await supabase
            .from('media_favorites')
            .delete()
            .eq('file_path', itemPath);
            
          // Delete the file
          await supabase
            .storage
            .from('media')
            .remove([itemPath]);
        }
        
        // Delete the .folder marker
        await supabase
          .storage
          .from('media')
          .remove([`${folderPath}/.folder`]);
          
      } else {
        // For files, simple delete
        const filePath = currentPath 
          ? `${currentPath}/${name}`
          : name;
          
        // Delete metadata
        await supabase
          .from('media_metadata')
          .delete()
          .eq('file_path', filePath);
        
        // Delete favorites
        await supabase
          .from('media_favorites')
          .delete()
          .eq('file_path', filePath);
          
        // Delete file
        const { error } = await supabase
          .storage
          .from('media')
          .remove([filePath]);
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Deleted',
        description: 'Item was deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['mediaFiles', currentPath] });
      setSelectedItems([]);
    },
    onError: (error: any) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ filePath, isFavorited }: { filePath: string, isFavorited: boolean }) => {
      if (!session?.user?.id) {
        throw new Error('You must be logged in');
      }
      
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('media_favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('file_path', filePath);
          
        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('media_favorites')
          .insert({
            user_id: session.user.id,
            file_path: filePath
          });
          
        if (error) throw error;
      }
      
      return { filePath, isFavorited: !isFavorited };
    },
    onSuccess: (data) => {
      toast({
        title: data.isFavorited ? 'Added to favorites' : 'Removed from favorites',
        description: data.isFavorited 
          ? 'File has been added to your favorites'
          : 'File has been removed from your favorites',
      });
      queryClient.invalidateQueries({ queryKey: ['mediaFiles'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Action failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle folder navigation
  const navigateToFolder = (folderName: string) => {
    if (folderName === '..') {
      // Go up one level
      const pathParts = currentPath.split('/');
      pathParts.pop();
      setCurrentPath(pathParts.join('/'));
    } else {
      // Go into a folder
      setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName);
    }
  };

  // File upload with react-dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadFileMutation.mutate(acceptedFiles[0]);
    }
  }, [uploadFileMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: false // Limit to single file upload for simplicity
  });

  // Handle folder creation
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolderMutation.mutate(newFolderName);
    }
  };

  // Handle file selection
  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle favorite toggle
  const handleToggleFavorite = (filePath: string, isFavorited: boolean, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    toggleFavoriteMutation.mutate({ filePath, isFavorited });
  };

  // Filter and sort the media items
  const filteredMedia = React.useMemo(() => {
    let folders: MediaFile[] = [];
    let files: MediaFile[] = [];

    if (mediaData) {
      folders = mediaData.folders || [];
      files = mediaData.files || [];

      // Apply search filter 
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        folders = folders.filter(folder => folder.name.toLowerCase().includes(query));
        files = files.filter(file => file.name.toLowerCase().includes(query));
      }

      // Apply favorites filter if the favorites tab is active
      if (activeTab === 'favorites') {
        folders = folders.filter(folder => folder.favorited);
        files = files.filter(file => file.favorited);
      }
    }
    
    // Sort files and folders
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
    
    folders = [...folders].sort(sortFiles);
    files = [...files].sort(sortFiles);
    
    return { folders, files };
  }, [mediaData, searchQuery, sortOption, activeTab]);

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

  return (
    <div className="space-y-4 pb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Files</h1>
        <div className="flex gap-2">
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

      {/* Breadcrumbs and search */}
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

      {/* Tabs for All Files and Favorites */}
      <Tabs defaultValue="all" onValueChange={setActiveTab} value={activeTab}>
        <TabsList>
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          {/* All files content */}
          {isLoadingMedia ? (
            <CenteredSpinner />
          ) : (
            <div className="space-y-8">
              {/* Folders section */}
              {filteredMedia.folders.length > 0 && (
                <div>
                  <h2 className="text-lg font-medium mb-4">Folders</h2>
                  <div className={viewMode === 'grid' ? 
                    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" : 
                    "space-y-2"
                  }>
                    <AnimatePresence>
                      {filteredMedia.folders.map((folder) => (
                        viewMode === 'grid' ? (
                          <motion.div
                            key={folder.id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                          >
                            <Card 
                              className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary/30"
                              onClick={() => navigateToFolder(folder.name)}
                            >
                              <CardContent className="p-4 flex flex-col items-center text-center">
                                <FolderIcon className="h-16 w-16 text-blue-400 mb-2" />
                                <p className="font-medium truncate w-full">{folder.name}</p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ) : (
                          <motion.div
                            key={folder.id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                          >
                            <div 
                              className="flex items-center p-3 rounded-md hover:bg-muted/50 cursor-pointer"
                              onClick={() => navigateToFolder(folder.name)}
                            >
                              <FolderIcon className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
                              <span className="font-medium">{folder.name}</span>
                            </div>
                          </motion.div>
                        )
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
              
              {/* Files section */}
              {filteredMedia.files.length > 0 ? (
                <div>
                  <h2 className="text-lg font-medium mb-4">Files</h2>
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
                            <Card className="overflow-hidden">
                              <CardContent className="p-0">
                                <div className="p-4 flex flex-col items-center">
                                  {file.fileType.startsWith('image/') ? (
                                    <div className="h-24 w-24 mb-2 flex items-center justify-center overflow-hidden">
                                      <img 
                                        src={file.url} 
                                        alt={file.name} 
                                        className="max-h-full max-w-full object-contain" 
                                      />
                                    </div>
                                  ) : (
                                    getFileIcon(file)
                                  )}
                                  <div className="w-full text-center mt-2">
                                    <p className="font-medium truncate" title={file.name}>
                                      {file.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatFileSize(file.size)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Uploaded by {file.uploadedBy}
                                    </p>
                                  </div>
                                </div>
                                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-7 w-7 rounded-full bg-black/20 hover:bg-black/30 text-white"
                                          onClick={(e) => handleToggleFavorite(filePath, file.favorited, e)}
                                        >
                                          <HeartIcon 
                                            className={`h-4 w-4 ${file.favorited ? 'fill-red-500 text-red-500' : ''}`} 
                                          />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {file.favorited ? 'Remove from favorites' : 'Add to favorites'}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 rounded-full bg-black/20 hover:bg-black/30 text-white"
                                      >
                                        <ChevronDown className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem asChild>
                                        <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                                          Download
                                        </a>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-500 focus:text-red-500"
                                        onClick={() => deleteFileMutation.mutate({ path: currentPath, isFolder: false, name: file.name })}
                                      >
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                {file.favorited && (
                                  <div className="absolute top-0 left-0 m-2">
                                    <HeartIcon className="h-4 w-4 fill-red-500 text-red-500" />
                                  </div>
                                )}
                              </CardContent>
                            </Card>
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
                            <div className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 group">
                              <div className="flex items-center flex-1 min-w-0">
                                <div className="flex-shrink-0 mr-3">
                                  {file.fileType.startsWith('image/') ? (
                                    <div className="h-10 w-10 rounded overflow-hidden flex items-center justify-center bg-muted">
                                      <img 
                                        src={file.url} 
                                        alt={file.name} 
                                        className="max-h-full max-w-full object-contain" 
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-10 w-10 flex items-center justify-center">
                                      {getFileIcon(file)}
                                    </div>
                                  )}
                                </div>
                                <div className="truncate">
                                  <p className="font-medium truncate" title={file.name}>
                                    {file.name}
                                  </p>
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <span>{formatFileSize(file.size)}</span>
                                    <span className="mx-2">•</span>
                                    <span>Uploaded by {file.uploadedBy}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4 flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={(e) => handleToggleFavorite(filePath, file.favorited, e)}
                                >
                                  <HeartIcon 
                                    className={`h-4 w-4 ${file.favorited ? 'fill-red-500 text-red-500' : ''}`} 
                                  />
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8"
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                                        Download
                                      </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-500 focus:text-red-500"
                                      onClick={() => deleteFileMutation.mutate({ path: currentPath, isFolder: false, name: file.name })}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              ) : !isLoadingMedia && filteredMedia.folders.length === 0 && (
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
          {/* Favorites content - reuses the same layout */}
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
                          <Card className="overflow-hidden">
                            <CardContent className="p-0">
                              <div className="p-4 flex flex-col items-center">
                                {file.fileType.startsWith('image/') ? (
                                  <div className="h-24 w-24 mb-2 flex items-center justify-center overflow-hidden">
                                    <img 
                                      src={file.url} 
                                      alt={file.name} 
                                      className="max-h-full max-w-full object-contain" 
                                    />
                                  </div>
                                ) : (
                                  getFileIcon(file)
                                )}
                                <div className="w-full text-center mt-2">
                                  <p className="font-medium truncate" title={file.name}>
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(file.size)}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Uploaded by {file.uploadedBy}
                                  </p>
                                </div>
                              </div>
                              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 rounded-full bg-black/20 hover:bg-black/30 text-white"
                                  onClick={(e) => handleToggleFavorite(filePath, file.favorited, e)}
                                >
                                  <HeartIcon 
                                    className={`h-4 w-4 ${file.favorited ? 'fill-red-500 text-red-500' : ''}`} 
                                  />
                                </Button>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 rounded-full bg-black/20 hover:bg-black/30 text-white"
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                                        Download
                                      </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-500 focus:text-red-500"
                                      onClick={() => deleteFileMutation.mutate({ path: currentPath, isFolder: false, name: file.name })}
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              {file.favorited && (
                                <div className="absolute top-0 left-0 m-2">
                                  <HeartIcon className="h-4 w-4 fill-red-500 text-red-500" />
                                </div>
                              )}
                            </CardContent>
                          </Card>
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
                          <div className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 group">
                            <div className="flex items-center flex-1 min-w-0">
                              <div className="flex-shrink-0 mr-3">
                                {file.fileType.startsWith('image/') ? (
                                  <div className="h-10 w-10 rounded overflow-hidden flex items-center justify-center bg-muted">
                                    <img 
                                      src={file.url} 
                                      alt={file.name} 
                                      className="max-h-full max-w-full object-contain" 
                                    />
                                  </div>
                                ) : (
                                  <div className="h-10 w-10 flex items-center justify-center">
                                    {getFileIcon(file)}
                                  </div>
                                )}
                              </div>
                              <div className="truncate">
                                <p className="font-medium truncate" title={file.name}>
                                  {file.name}
                                </p>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <span>{formatFileSize(file.size)}</span>
                                  <span className="mx-2">•</span>
                                  <span>Uploaded by {file.uploadedBy}</span>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4 flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={(e) => handleToggleFavorite(filePath, file.favorited, e)}
                              >
                                <HeartIcon 
                                  className={`h-4 w-4 ${file.favorited ? 'fill-red-500 text-red-500' : ''}`} 
                                />
                              </Button>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                                      Download
                                    </a>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-500 focus:text-red-500"
                                    onClick={() => deleteFileMutation.mutate({ path: currentPath, isFolder: false, name: file.name })}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
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
