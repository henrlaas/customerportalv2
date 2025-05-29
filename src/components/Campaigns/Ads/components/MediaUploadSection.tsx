
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image, Video } from 'lucide-react';
import { Platform } from '../../types/campaign';
import { FileInfo } from '../types';

interface Props {
  fileInfo: FileInfo | null;
  setFileInfo: (fileInfo: FileInfo | null) => void;
  platform: Platform;
}

export function MediaUploadSection({ fileInfo, setFileInfo, platform }: Props) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    let adType: 'image' | 'video' | 'text' = 'text';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '')) {
      adType = 'image';
    } else if (['mp4', 'webm', 'mov'].includes(fileExt || '')) {
      adType = 'video';
    }
    
    const previewUrl = URL.createObjectURL(file);
    setFileInfo({
      url: previewUrl,
      type: adType,
      file
    });
  };
  
  const removeFile = () => {
    if (fileInfo?.url) {
      URL.revokeObjectURL(fileInfo.url);
    }
    setFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const getAcceptedTypes = () => {
    switch (platform) {
      case 'Snapchat':
      case 'Tiktok':
        return 'image/*,video/*';
      default:
        return 'image/*,video/*';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Media Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!fileInfo ? (
          <div 
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              Images and videos supported
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={getAcceptedTypes()}
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              {fileInfo.type === 'image' ? (
                <img
                  src={fileInfo.url}
                  alt="Upload preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
              ) : fileInfo.type === 'video' ? (
                <video
                  src={fileInfo.url}
                  controls
                  className="w-full h-40 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-8 w-8 mx-auto mb-2">
                      {fileInfo.type === 'video' ? (
                        <Video className="h-8 w-8" />
                      ) : (
                        <Image className="h-8 w-8" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {fileInfo.file?.name || 'Unknown file'}
                    </p>
                  </div>
                </div>
              )}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={removeFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              Change File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={getAcceptedTypes()}
              onChange={handleFileChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
