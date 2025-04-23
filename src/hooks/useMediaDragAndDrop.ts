
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
  const { renameFolderMutation } = useMediaOperations(currentPath, null, activeTab);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { session } = useAuth(); // Get the session directly from AuthContext

  const handleDragStart = (event: any) => {
    const fileData = event.active.data.current as MediaFile;
    setActiveDragItem(fileData);
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    setActiveDragItem(null);
    
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const fileData = active.data.current as MediaFile;
    const targetFolder = over.data.current as MediaFile;
    
    if (!fileData || !targetFolder || !targetFolder.isFolder) return;

    // Check if user is logged in
    if (!session?.user?.id) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to move files',
        variant: 'destructive',
      });
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

    // Construct the new path
    const sourceFolder = currentPath;
    const targetPath = currentPath 
      ? `${currentPath}/${targetFolder.name}`
      : targetFolder.name;

    try {
      const oldPath = sourceFolder 
        ? `${sourceFolder}/${fileData.name}`
        : fileData.name;

      await renameFolderMutation.mutateAsync({
        oldPath,
        newName: `${targetPath}/${fileData.name}`,
      });

      toast({
        title: 'File moved',
        description: `Successfully moved ${fileData.name} to ${targetFolder.name}`,
      });

      // Invalidate queries to refresh the view
      queryClient.invalidateQueries({ queryKey: ['mediaFiles'] });
    } catch (error) {
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
