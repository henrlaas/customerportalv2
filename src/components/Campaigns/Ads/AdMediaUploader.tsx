
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileInfo } from './types';

interface AdMediaUploaderProps {
  fileInfo: FileInfo | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}

export function AdMediaUploader({ fileInfo, onFileChange, onRemoveFile }: AdMediaUploaderProps) {
  return (
    <div className="space-y-2">
      <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
        {fileInfo ? (
          <div className="space-y-4">
            <div className="relative h-48 mx-auto max-w-xs">
              {fileInfo.type === 'image' ? (
                <img 
                  src={fileInfo.url} 
                  alt="Ad preview" 
                  className="w-full h-full object-contain rounded-md"
                />
              ) : fileInfo.type === 'video' ? (
                <video 
                  src={fileInfo.url} 
                  controls 
                  className="w-full h-full object-contain rounded-md"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  File selected: {fileInfo.file.name}
                </div>
              )}
            </div>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onRemoveFile}
            >
              Change File
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center py-6">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-gray-600 mb-2">Upload an image or video for your ad</p>
              <p className="text-sm text-gray-500 mb-4">Supports: JPG, PNG, GIF, MP4, WebM</p>
              <Input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                id="file-upload"
                onChange={onFileChange}
              />
              <label htmlFor="file-upload">
                <Button type="button" variant="secondary">
                  <span>Browse Files</span>
                </Button>
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
