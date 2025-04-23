
export const getFileTypeFromName = (fileName: string): string => {
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

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

import { supabase } from '@/integrations/supabase/client';

export const cleanupMediaBucket = async () => {
  // First list all contents
  const { data: contents, error: listError } = await supabase
    .storage
    .from('media')
    .list();

  if (listError) {
    throw listError;
  }

  // Go through each item
  for (const item of contents || []) {
    // If it's a folder (no id means it's a folder), list its contents first
    if (!item.id) {
      const { data: folderContents, error: folderListError } = await supabase
        .storage
        .from('media')
        .list(item.name);

      if (folderListError) {
        throw folderListError;
      }

      // Delete all files in the folder
      for (const folderItem of folderContents || []) {
        const filePath = `${item.name}/${folderItem.name}`;
        await supabase
          .storage
          .from('media')
          .remove([filePath]);

        // Also clean up metadata and favorites
        await supabase
          .from('media_metadata')
          .delete()
          .eq('file_path', filePath);

        await supabase
          .from('media_favorites')
          .delete()
          .eq('file_path', filePath);
      }

      // Delete the folder marker
      await supabase
        .storage
        .from('media')
        .remove([`${item.name}/.folder`]);
    } else {
      // Delete the file directly
      await supabase
        .storage
        .from('media')
        .remove([item.name]);

      // Clean up metadata and favorites for the file
      await supabase
        .from('media_metadata')
        .delete()
        .eq('file_path', item.name);

      await supabase
        .from('media_favorites')
        .delete()
        .eq('file_path', item.name);
    }
  }
};

// New function to find problematic entries in the storage bucket
export const detectAnomalousEntries = async () => {
  try {
    // List all items in the media bucket
    const { data: contents, error: listError } = await supabase
      .storage
      .from('media')
      .list();

    if (listError) {
      console.error("Error listing bucket contents:", listError);
      return { anomalies: [], error: listError.message };
    }

    // Identify problematic entries
    const anomalies = contents?.filter(item => {
      // Check for empty names, undefined names, or other issues
      const hasEmptyName = !item.name || item.name.trim() === "";
      const hasInvalidName = item.name === "." || item.name === ".." || item.name === "/";
      const hasNoProperID = !item.id && item.name !== undefined; // Folders typically lack IDs
      
      return hasEmptyName || hasInvalidName || hasNoProperID;
    }) || [];

    return { anomalies, totalItems: contents?.length || 0 };
  } catch (error: any) {
    console.error("Error detecting anomalous entries:", error);
    return { anomalies: [], error: error.message };
  }
};

// New function to specifically remove problematic entries
export const removeAnomalousEntry = async (entryName: string) => {
  try {
    // If the entry name is empty or undefined, we'll use a special marker
    const pathToRemove = entryName || ".empty_entry";
    
    // Try to remove it as a file
    await supabase
      .storage
      .from('media')
      .remove([pathToRemove]);
      
    // Also clean up any associated metadata
    await supabase
      .from('media_metadata')
      .delete()
      .eq('file_path', pathToRemove);
      
    await supabase
      .from('media_favorites')
      .delete()
      .eq('file_path', pathToRemove);
      
    return { success: true };
  } catch (error: any) {
    console.error("Error removing anomalous entry:", error);
    return { success: false, error: error.message };
  }
};
