
import React, { useState } from 'react';
import { FileUploader } from "@/components/FileUploader";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { FileIcon, CheckIcon, XIcon } from "lucide-react";

interface FileUploadStepProps {
  contractData: {
    file_url: string;
  };
  updateContractData: (data: Partial<{ file_url: string }>) => void;
}

export const FileUploadStep: React.FC<FileUploadStepProps> = ({ contractData, updateContractData }) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Generate a unique file path to avoid conflicts
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `contracts/${fileName}`;
      
      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) throw error;
      
      // Get public URL for the file
      const { data: publicUrlData } = await supabase.storage
        .from('media')
        .getPublicUrl(filePath);
      
      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw new Error(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleFileUploaded = (url: string) => {
    updateContractData({ file_url: url });
    toast({
      title: 'File uploaded successfully',
      description: 'Your contract document has been uploaded.',
    });
  };

  const handleRemoveFile = () => {
    updateContractData({ file_url: '' });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Upload Contract Document</h2>
      <p className="text-sm text-muted-foreground">
        Upload the contract document (optional). Supported formats: PDF, DOC, DOCX.
      </p>

      {contractData.file_url ? (
        <div className="border rounded-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileIcon className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">Contract document</p>
                <p className="text-sm text-muted-foreground truncate max-w-xs">
                  {contractData.file_url.split('/').pop()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-green-500" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRemoveFile}
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <FileUploader
          onUpload={handleFileUpload}
          onUploaded={handleFileUploaded}
          isUploading={isUploading}
          accept={{
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
          }}
          maxSize={10 * 1024 * 1024} // 10MB
        />
      )}

      <div className="text-sm text-muted-foreground mt-4">
        <p>Note: If you don't have the contract document ready, you can skip this step and upload it later.</p>
      </div>
    </div>
  );
};
