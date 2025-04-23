import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MediaFile } from '@/types/media';

export const useMediaOperations = (currentPath: string, session: any) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!session?.user?.id) {
        throw new Error('You must be logged in to upload files');
      }
      
      try {
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
      } catch (error: any) {
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'File uploaded',
        description: 'Your file has been uploaded successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['mediaFiles', currentPath] });
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

  // Delete file/folder mutation
  const deleteFileMutation = useMutation({
    mutationFn: async ({ path, isFolder, name }: { path: string, isFolder: boolean, name: string }) => {
      if (!session?.user?.id) {
        throw new Error('You must be logged in to delete files');
      }
      
      if (isFolder) {
        const folderPath = path 
          ? `${path}/${name}`
          : name;
          
        const { data: folderContents, error: listError } = await supabase
          .storage
          .from('media')
          .list(folderPath);
          
        if (listError) throw listError;
        
        for (const item of folderContents || []) {
          const itemPath = `${folderPath}/${item.name}`;
          
          await supabase
            .from('media_metadata')
            .delete()
            .eq('file_path', itemPath);
          
          await supabase
            .from('media_favorites')
            .delete()
            .eq('file_path', itemPath);
            
          await supabase
            .storage
            .from('media')
            .remove([itemPath]);
        }
        
        await supabase
          .storage
          .from('media')
          .remove([`${folderPath}/.folder`]);
      } else {
        const filePath = path 
          ? `${path}/${name}`
          : name;
          
        await supabase
          .from('media_metadata')
          .delete()
          .eq('file_path', filePath);
        
        await supabase
          .from('media_favorites')
          .delete()
          .eq('file_path', filePath);
          
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
    },
    onError: (error: any) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Rename folder mutation
  const renameFolderMutation = useMutation({
    mutationFn: async ({ oldPath, newName }: { oldPath: string, newName: string }) => {
      if (!session?.user?.id) {
        throw new Error('You must be logged in to rename folders');
      }

      const oldFolderPath = oldPath ? `${oldPath}/.folder` : '.folder';
      const newFolderPath = oldPath.includes('/')
        ? `${oldPath.substring(0, oldPath.lastIndexOf('/'))}/${newName}/.folder`
        : `${newName}/.folder`;

      const { data: files, error: listError } = await supabase
        .storage
        .from('media')
        .list(oldPath);

      if (listError) throw listError;

      for (const file of files || []) {
        if (file.name === '.folder') continue;

        const oldFilePath = `${oldPath}/${file.name}`;
        const newFilePath = `${oldPath.substring(0, oldPath.lastIndexOf('/'))}/${newName}/${file.name}`;

        const { error: moveError } = await supabase
          .storage
          .from('media')
          .move(oldFilePath, newFilePath);

        if (moveError) throw moveError;

        await supabase
          .from('media_metadata')
          .update({ file_path: newFilePath })
          .eq('file_path', oldFilePath);

        await supabase
          .from('media_favorites')
          .update({ file_path: newFilePath })
          .eq('file_path', oldFilePath);
      }

      const { error: moveFolderError } = await supabase
        .storage
        .from('media')
        .move(oldFolderPath, newFolderPath);

      if (moveFolderError) throw moveFolderError;
    },
    onSuccess: () => {
      toast({
        title: 'Folder renamed',
        description: 'The folder has been renamed successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['mediaFiles', currentPath] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to rename folder',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Toggle favorite mutation - updated to match the expected parameter type
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ filePath, isFavorited }: { filePath: string, isFavorited: boolean }) => {
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

  return {
    uploadFileMutation,
    createFolderMutation,
    deleteFileMutation,
    renameFolderMutation,
    toggleFavoriteMutation,
  };
};
