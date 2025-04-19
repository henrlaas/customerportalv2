
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UploadCloud, X } from 'lucide-react';
import { AdFormData } from '../../types/campaign';
import { FileInfo } from '../types';

interface BasicInfoStepProps {
  form: UseFormReturn<AdFormData>;
  fileInfo: FileInfo | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onNextStep: () => void;
  hideFileUpload?: boolean;
}

export function BasicInfoStep({
  form, 
  fileInfo, 
  onFileChange, 
  onRemoveFile,
  onNextStep,
  hideFileUpload = false
}: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ad Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter your ad name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {!hideFileUpload && (
        <div className="space-y-4">
          <p className="text-sm font-medium">Media Upload</p>
          
          {fileInfo ? (
            <div className="relative rounded-md border overflow-hidden">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 shadow-md hover:bg-background"
                onClick={onRemoveFile}
              >
                <X className="h-4 w-4" />
              </Button>
              
              {fileInfo.type === 'image' ? (
                <img
                  src={fileInfo.url}
                  alt="Ad preview"
                  className="w-full h-48 object-contain"
                />
              ) : fileInfo.type === 'video' ? (
                <video
                  src={fileInfo.url}
                  controls
                  className="w-full h-48 object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-48 bg-muted">
                  <p className="text-sm text-muted-foreground">{fileInfo.file.name}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, GIF or MP4 (MAX. 20MB)
                  </p>
                </div>
                <input 
                  id="dropzone-file" 
                  type="file" 
                  className="hidden" 
                  accept="image/*,video/*"
                  onChange={onFileChange}
                />
              </label>
            </div>
          )}
        </div>
      )}

      {/* Removed the extra Next button */}
    </div>
  );
}
