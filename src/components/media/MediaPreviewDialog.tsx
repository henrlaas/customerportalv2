
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MediaFile } from '@/types/media';
import { formatFileSize } from '@/utils/mediaUtils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  file: MediaFile | null;
}

export const MediaPreviewDialog: React.FC<MediaPreviewDialogProps> = ({
  isOpen,
  onClose,
  file,
}) => {
  if (!file) return null;

  const isImage = file.fileType.startsWith('image/');
  const isVideo = file.fileType.startsWith('video/');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold">{file.name}</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                {file.fileType} • {formatFileSize(file.size)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
            {isImage && (
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full max-h-[60vh] object-contain rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const errorDiv = document.createElement('div');
                  errorDiv.textContent = 'Failed to load image';
                  errorDiv.className = 'text-gray-500 text-center';
                  target.parentNode?.appendChild(errorDiv);
                }}
              />
            )}
            
            {isVideo && (
              <video
                src={file.url}
                controls
                className="max-w-full max-h-[60vh] rounded"
                onError={(e) => {
                  const target = e.target as HTMLVideoElement;
                  target.style.display = 'none';
                  const errorDiv = document.createElement('div');
                  errorDiv.textContent = 'Failed to load video';
                  errorDiv.className = 'text-gray-500 text-center';
                  target.parentNode?.appendChild(errorDiv);
                }}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
