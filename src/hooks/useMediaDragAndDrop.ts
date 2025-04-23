
import { useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { useMediaOperations } from './useMediaOperations';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { MediaFile } from '@/types/media';
import { useAuth } from '@/contexts/AuthContext';

export const useMediaDragAndDrop = (currentPath: string, activeTab: string) => {
  const [isDragging, setIsDragging] = useState(false);
  const [activeDragItem, setActiveDragItem] = useState<MediaFile | null>(null);
  const { session } = useAuth(); // Get the session directly from AuthContext
  const { renameFolderMutation } = useMediaOperations(currentPath, session, activeTab);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDragStart = (event: any) => {
    const fileData = event.active.data.current as MediaFile;
    setActiveDragItem(fileData);
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    
    const { active, over } = event;
    
    // Exit if no over target or same element
    if (!over || active.id === over.id) {
      setActiveDragItem(null);
      return;
    }
    
    // Get the file data from the active element
    const fileData = active.data.current as MediaFile;
    // Get the target folder data from the over element
    const targetFolder = over.data.current as MediaFile;
    
    setActiveDragItem(null);
    
    // Exit if we don't have valid data
    if (!fileData || !targetFolder) {
      console.log("Missing data for drag operation", { fileData, targetFolder });
      return;
    }

    // Check if user is logged in
    if (!session?.user?.id) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to move files',
        variant: 'destructive',
      });
      return;
    }

    // Skip if not dropping on a folder
    if (!targetFolder.isFolder) {
      console.log("Target is not a folder", targetFolder);
      return;
    }

    // Don't allow dropping into company root folders from internal tab
    if (activeTab === 'internal' && targetFolder.isCompanyFolder) {
      toast({
        title: 'Operation not allowed',
        description: 'Cannot move files from internal storage to company folders',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Construct the proper source file path
      const sourceFilePath = currentPath 
        ? `${currentPath}/${fileData.name}`
        : fileData.name;
      
      // Construct the proper target folder path
      const targetFolderPath = targetFolder.name;
      
      // Construct the new destination file path
      const destinationFilePath = `${targetFolderPath}/${fileData.name}`;
      
      console.log("Moving file", { 
        source: sourceFilePath, 
        destination: destinationFilePath,
        currentPath: currentPath,
        targetFolder: targetFolder
      });
      
      await renameFolderMutation.mutateAsync({
        oldPath: sourceFilePath,
        newName: destinationFilePath,
      });

      toast({
        title: 'File moved',
        description: `Successfully moved ${fileData.name} to ${targetFolder.name}`,
      });

      // Invalidate queries to refresh the view
      queryClient.invalidateQueries({ queryKey: ['mediaFiles'] });
    } catch (error) {
      console.error("Error moving file:", error);
      toast({
        title: 'Error moving file',
        description: error instanceof Error ? error.message : 'Failed to move file',
        variant: 'destructive',
      });
    }
  };

  return {
    isDragging,
    setIsDragging,
    activeDragItem,
    handleDragStart,
    handleDragEnd,
  };
};
