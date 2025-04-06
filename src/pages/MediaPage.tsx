
import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FolderArchive, 
  Image, 
  FileText, 
  FileVideo, 
  Upload, 
  FolderPlus,
  Search,
  Trash2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

// Define media file type
type MediaFile = {
  id: string;
  name: string;
  fileType: string;
  campaignId?: string | null;
  url: string;
  size: number;
  created_at: string;
};

type Folder = {
  name: string;
  isFolder: true;
};

// Define campaign media type to match the database
type CampaignMedia = {
  id: string;
  campaign_id: string | null;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
  created_by: string | null;
};

const MediaPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Fetch media files from Supabase storage
  const { data: mediaFiles = [], isLoading } = useQuery({
    queryKey: ['mediaFiles', currentPath],
    queryFn: async () => {
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

        // Then get files from campaign_media for additional metadata
        // Added type casting to fix the type error
        const { data: mediaMetadata, error: mediaError } = await supabase
          .from('campaign_media')
          .select('*') as { data: CampaignMedia[] | null, error: any };
          
        if (mediaError) throw mediaError;
        
        // Process folders first
        const folderItems: Folder[] = folders
          ?.filter(item => item.id === null) // Folders have id === null
          .map(folder => ({
            name: folder.name,
            isFolder: true,
          })) || [];
          
        // Process files with their metadata
        const fileItems: MediaFile[] = folders
          ?.filter(item => item.id !== null) // Files have id !== null
          .map(file => {
            // Find matching metadata if available
            const metadata = mediaMetadata?.find(meta => 
              meta.file_name === file.name || meta.file_url.includes(file.name)
            );
            
            // Build the complete URL
            const url = supabase.storage.from('media').getPublicUrl(
              currentPath ? `${currentPath}/${file.name}` : file.name
            ).data.publicUrl;
            
            return {
              id: file.id || '',
              name: file.name,
              fileType: file.metadata?.mimetype || getFileTypeFromName(file.name),
              campaignId: metadata?.campaign_id || null,
              url: url,
              size: file.metadata?.size || 0,
              created_at: file.created_at || new Date().toISOString(),
            };
          }) || [];
        
        // Combine folders and files
        return [...folderItems, ...fileItems];
      } catch (error: any) {
        toast({
          title: 'Error fetching media',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
    },
  });
  
  // Function to infer file type from name
  const getFileTypeFromName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
      return 'image';
    } else if (['mp4', 'webm', 'mov', 'avi'].includes(extension)) {
      return 'video';
    } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) {
      return 'document';
    } else {
      return 'unknown';
    }
  };

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
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
          .from('campaign_media')
          .insert([
            {
              file_name: file.name,
              file_url: publicUrl,
              file_type: file.type,
              file_size: file.size,
              created_by: (await supabase.auth.getSession()).data.session?.user.id
            }
          ] as any); // Type assertion to any since the interface doesn't match
          
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
      if (isFolder) {
        // For folders, we need to list and delete all contents
        const folderPath = currentPath 
          ? `${currentPath}/${name}`
          : name;
          
        // List all files in the folder
        const { data: folderContents, error: listError } = await supabase
          .storage
          .from('media')
          .list(folderPath, {
            limit: 100,
            offset: 0,
          });
          
        if (listError) throw listError;
        
        // Delete each file in the folder
        for (const item of folderContents || []) {
          const itemPath = `${folderPath}/${item.name}`;
          const { error } = await supabase
            .storage
            .from('media')
            .remove([itemPath]);
            
          if (error) throw error;
        }
        
        // Delete the .folder marker
        const { error: folderError } = await supabase
          .storage
          .from('media')
          .remove([`${folderPath}/.folder`]);
          
        if (folderError) throw folderError;
      } else {
        // For files, simple delete
        const filePath = currentPath 
          ? `${currentPath}/${name}`
          : name;
          
        const { error } = await supabase
          .storage
          .from('media')
          .remove([filePath]);
          
        if (error) throw error;
        
        // Also remove from campaign_media if it exists
        await supabase
          .from('campaign_media')
          .delete()
          .match({ file_name: name }) as any; // Type assertion to fix compatibility issue
      }
    },
    onSuccess: () => {
      toast({
        title: 'Deleted',
        description: 'Item was deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['mediaFiles', currentPath] });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete failed',
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
    maxFiles: 1
  });

  // Handle folder creation
  const handleCreateFolder = () => {
    createFolderMutation.mutate(newFolderName);
  };

  // Filter media items based on search
  const filteredMedia = mediaFiles.filter((item: any) => 
    'name' in item && item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the appropriate icon for a file based on its type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) {
      return <Image className="h-12 w-12 mb-2 text-blue-500" />;
    } else if (fileType.includes('video')) {
      return <FileVideo className="h-12 w-12 mb-2 text-red-500" />;
    } else {
      return <FileText className="h-12 w-12 mb-2 text-gray-500" />;
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <div className="flex gap-2">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
                <DialogDescription>
                  Drag and drop a file or click to select one
                </DialogDescription>
              </DialogHeader>
              
              <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50">
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop the file here...</p>
                ) : (
                  <div>
                    <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                    <p>Drag and drop a file here, or click to select a file</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported file types: Images, Documents, Videos
                    </p>
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
          
          <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100">
                <FolderPlus className="h-4 w-4 mr-2" />
                Create Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Enter a name for your new folder
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
                <Button onClick={handleCreateFolder} disabled={!newFolderName}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b px-4 py-3 flex items-center">
          <h2 className="font-medium">
            {currentPath ? currentPath : 'All Files'}
          </h2>
          <div className="ml-auto flex items-center gap-2">
            {currentPath && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateToFolder('..')}
                className="text-sm"
              >
                Up a level
              </Button>
            )}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search media..."
                className="pl-8 py-1 text-sm h-9 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <FolderArchive className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium">No files found</h3>
            <p className="text-gray-500 mb-4">Upload files or create folders to get started</p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
              <Button variant="outline" onClick={() => setIsFolderDialogOpen(true)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Create Folder
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
            {filteredMedia.map((item: any, index) => (
              <Card 
                key={index} 
                className="group cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => item.isFolder ? navigateToFolder(item.name) : null}
              >
                <CardContent className="p-3 flex flex-col items-center relative">
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFileMutation.mutate({ 
                          path: currentPath, 
                          isFolder: !!item.isFolder, 
                          name: item.name 
                        });
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                  {item.isFolder ? (
                    <FolderArchive className="h-12 w-12 mb-2 text-amber-500" />
                  ) : (
                    item.fileType && getFileIcon(item.fileType)
                  )}
                  <span className="text-sm font-medium text-center truncate w-full">
                    {item.name}
                  </span>
                  {!item.isFolder && item.size && (
                    <span className="text-xs text-gray-500 mt-1">
                      {formatFileSize(item.size)}
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaPage;
