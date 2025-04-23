import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Session } from '@supabase/supabase-js';

export const useMediaOperations = (currentPath: string, session: Session | null, activeTab: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!session?.user?.id) {
        throw new Error('You must be logged in to upload files');
      }
      
      try {
        // Determine the correct bucket based on the activeTab parameter
        const bucketId = activeTab === 'company' ? 'companymedia' : 'media';
        
        // Define the file path - for company media, ensure we have the company name as the first path segment
        let filePath;
        if (bucketId === 'companymedia' && !currentPath) {
          throw new Error('Company name is required for company media uploads');
        } else {
          // Always generate a unique filename to avoid conflicts
          const extension = file.name.split('.').pop();
          const baseName = file.name.replace(`.${extension}`, '');
          const timestamp = new Date().getTime();
          const uniqueFileName = `${baseName}_${timestamp}.${extension}`;
          
          filePath = currentPath 
            ? `${currentPath}/${uniqueFileName}`
            : uniqueFileName;
        }
        
        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from(bucketId)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from(bucketId)
          .getPublicUrl(filePath);
          
        // Create new metadata record
        const { error: metadataError } = await supabase
          .from('media_metadata')
          .insert({
            file_path: filePath,
            uploaded_by: session.user.id,
            file_size: file.size,
            mime_type: file.type,
            original_name: file.name,
            bucket_id: bucketId
          });
              
        if (metadataError) throw metadataError;
        
        return { path: uploadData?.path, bucketId };
      } catch (error: any) {
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'File uploaded',
        description: 'Your file has been uploaded successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['mediaFiles'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create folder mutation - Updated to support both internal and company folders
  const createFolderMutation = useMutation({
    mutationFn: async (folderName: string) => {
      if (!session?.user?.id) {
        throw new Error('You must be logged in to create folders');
      }
      
      if (!folderName.trim()) {
        throw new Error('Folder name cannot be empty');
      }
      
      // Determine the correct bucket based on the activeTab parameter
      const bucketId = activeTab === 'company' ? 'companymedia' : 'media';
      
      // For company media, ensure we have a current path (must be inside a company folder)
      if (bucketId === 'companymedia' && !currentPath) {
        throw new Error('You must navigate into a company folder before creating new folders');
      }
      
      const folderPath = currentPath
        ? `${currentPath}/${folderName}/.folder` 
        : `${folderName}/.folder`;
      
      const { error } = await supabase
        .storage
        .from(bucketId)
        .upload(folderPath, new Blob([''], { type: 'text/plain' }), {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) throw error;
      
      return { folderName, bucketId };
    },
    onSuccess: () => {
      toast({
        title: 'Folder created',
        description: 'Your folder has been created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['mediaFiles'] });
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
    mutationFn: async ({ 
      path, 
      isFolder, 
      name, 
      bucketId = 'media'
    }: { 
      path: string, 
      isFolder: boolean, 
      name: string,
      bucketId?: string  
    }) => {
      if (!session?.user?.id) {
        throw new Error('You must be logged in to delete files');
      }
      
      // Prevent deletion of company root folders
      const isCompanyRootFolder = path === '' && bucketId === 'companymedia';
      if (isFolder && isCompanyRootFolder) {
        throw new Error('Company folders cannot be deleted');
      }
      
      if (isFolder) {
        const folderPath = path 
          ? `${path}/${name}`
          : name;
          
        const { data: folderContents, error: listError } = await supabase
          .storage
          .from(bucketId)
          .list(folderPath);
          
        if (listError) throw listError;
        
        // Delete all files in folder
        for (const item of folderContents || []) {
          const itemPath = `${folderPath}/${item.name}`;
          
          await supabase
            .from('media_metadata')
            .delete()
            .eq('file_path', itemPath)
            .eq('bucket_id', bucketId);
          
          await supabase
            .from('media_favorites')
            .delete()
            .eq('file_path', itemPath);
            
          await supabase
            .storage
            .from(bucketId)
            .remove([itemPath]);
        }
        
        // Delete folder marker
        await supabase
          .storage
          .from(bucketId)
          .remove([`${folderPath}/.folder`]);
      } else {
        // Delete a regular file
        const filePath = path 
          ? `${path}/${name}`
          : name;
          
        await supabase
          .from('media_metadata')
          .delete()
          .eq('file_path', filePath)
          .eq('bucket_id', bucketId);
        
        await supabase
          .from('media_favorites')
          .delete()
          .eq('file_path', filePath);
          
        const { error } = await supabase
          .storage
          .from(bucketId)
          .remove([filePath]);
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Deleted',
        description: 'Item was deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['mediaFiles'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Rename folder mutation - Updated to handle file movements correctly and preserve metadata
  const renameFolderMutation = useMutation({
    mutationFn: async ({ 
      oldPath, 
      newName,
      preserveMetadata
    }: { 
      oldPath: string, 
      newName: string,
      preserveMetadata?: {
        uploadedBy?: string;
        originalName?: string;
        fileSize?: number;
        mimeType?: string;
      }
    }) => {
      if (!session?.user?.id) {
        throw new Error('You must be logged in to rename folders');
      }
      
      // Determine the correct bucket based on the activeTab parameter
      const bucketId = activeTab === 'company' ? 'companymedia' : 'media';
      
      // Prevent renaming of company root folders
      if (bucketId === 'companymedia' && !oldPath.includes('/')) {
        throw new Error('Company root folders cannot be renamed');
      }

      console.log(`Moving from ${oldPath} to ${newName} in bucket ${bucketId}`);

      // If this is a file move operation (not a folder rename)
      if (!oldPath.endsWith('/')) {
        // Check if source file exists
        const { data: existsData, error: existsError } = await supabase
          .storage
          .from(bucketId)
          .list(currentPath || '', {
            search: oldPath.split('/').pop()
          });

        if (existsError) {
          console.error("Error checking file existence:", existsError);
          throw existsError;
        }

        if (!existsData || existsData.length === 0) {
          throw new Error(`Source file not found: ${oldPath}`);
        }

        // Move the file directly
        const { error: moveError } = await supabase
          .storage
          .from(bucketId)
          .move(oldPath, newName);

        if (moveError) {
          console.error("Error moving file:", moveError);
          throw moveError;
        }

        // Get the existing metadata record to preserve important fields
        const { data: existingMetadata } = await supabase
          .from('media_metadata')
          .select('*')
          .eq('file_path', oldPath)
          .eq('bucket_id', bucketId)
          .single();

        console.log("Existing metadata:", existingMetadata);
        console.log("Preserve metadata:", preserveMetadata);

        // Update metadata with the new file path, but preserve the original uploader
        const metadataUpdate = {
          file_path: newName,
          // Use preserveMetadata if provided, otherwise keep existing data, or use the current user as fallback
          uploaded_by: preserveMetadata?.uploadedBy || 
                      (existingMetadata ? existingMetadata.uploaded_by : session.user.id),
          // Preserve other important metadata if available
          original_name: preserveMetadata?.originalName || 
                         (existingMetadata ? existingMetadata.original_name : newName.split('/').pop()),
          file_size: preserveMetadata?.fileSize || 
                     (existingMetadata ? existingMetadata.file_size : null),
          mime_type: preserveMetadata?.mimeType || 
                     (existingMetadata ? existingMetadata.mime_type : null)
        };

        // Update metadata
        const { error: metadataError } = await supabase
          .from('media_metadata')
          .update(metadataUpdate)
          .eq('file_path', oldPath)
          .eq('bucket_id', bucketId);
        
        if (metadataError) {
          console.error("Error updating metadata:", metadataError);
          
          // If the metadata update fails, try to insert a new record
          if (!existingMetadata) {
            await supabase
              .from('media_metadata')
              .insert({
                file_path: newName,
                uploaded_by: preserveMetadata?.uploadedBy || session.user.id,
                original_name: preserveMetadata?.originalName || newName.split('/').pop(),
                file_size: preserveMetadata?.fileSize || null,
                mime_type: preserveMetadata?.mimeType || null,
                bucket_id: bucketId
              });
          }
        }

        // Update favorites
        await supabase
          .from('media_favorites')
          .update({ file_path: newName })
          .eq('file_path', oldPath);

        return;
      }

      // Handle folder rename (original code for folder renaming)
      const oldFolderPath = `${oldPath}/.folder`;
      const newFolderPath = oldPath.includes('/')
        ? `${oldPath.substring(0, oldPath.lastIndexOf('/'))}/${newName}/.folder`
        : `${newName}/.folder`;

      const { data: files, error: listError } = await supabase
        .storage
        .from(bucketId)
        .list(oldPath);

      if (listError) throw listError;

      // Move each file to new location
      for (const file of files || []) {
        if (file.name === '.folder') continue;

        const oldFilePath = `${oldPath}/${file.name}`;
        const newFilePath = `${oldPath.substring(0, oldPath.lastIndexOf('/'))}/${newName}/${file.name}`;

        // Move the file
        const { error: moveError } = await supabase
          .storage
          .from(bucketId)
          .move(oldFilePath, newFilePath);

        if (moveError) throw moveError;

        // Get existing metadata to preserve uploaded_by information
        const { data: fileMetadata } = await supabase
          .from('media_metadata')
          .select('*')
          .eq('file_path', oldFilePath)
          .eq('bucket_id', bucketId)
          .single();
          
        // Update metadata
        await supabase
          .from('media_metadata')
          .update({ 
            file_path: newFilePath,
            // Keep the original uploaded_by if available
            uploaded_by: fileMetadata ? fileMetadata.uploaded_by : session.user.id
          })
          .eq('file_path', oldFilePath)
          .eq('bucket_id', bucketId);

        // Update favorites
        await supabase
          .from('media_favorites')
          .update({ file_path: newFilePath })
          .eq('file_path', oldFilePath);
      }

      // Move the folder marker
      const { error: moveFolderError } = await supabase
        .storage
        .from(bucketId)
        .move(oldFolderPath, newFolderPath);

      if (moveFolderError) throw moveFolderError;
    },
    onSuccess: () => {
      toast({
        title: 'Operation successful',
        description: 'The file or folder has been moved successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['mediaFiles'] });
    },
    onError: (error: any) => {
      console.error("Error in rename/move operation:", error);
      toast({
        title: 'Operation failed',
        description: error.message || 'Failed to move file or folder',
        variant: 'destructive',
      });
    },
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ 
      filePath, 
      isFavorited,
      bucketId = 'media'
    }: { 
      filePath: string, 
      isFavorited: boolean,
      bucketId?: string 
    }) => {
      if (!session?.user?.id) {
        throw new Error('You must be logged in');
      }
      
      if (isFavorited) {
        const { error } = await supabase
          .from('media_favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('file_path', filePath);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('media_favorites')
          .insert({
            user_id: session.user.id,
            file_path: filePath,
            bucket_id: bucketId
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

  return {
    uploadFileMutation,
    createFolderMutation,
    deleteFileMutation,
    renameFolderMutation,
    toggleFavoriteMutation,
  };
};
