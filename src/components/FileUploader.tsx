
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploaderProps {
  onUpload: (file: File) => Promise<string>;
  onUploaded?: (url: string) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onUpload, 
  onUploaded,
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png']
  },
  maxSize = 5242880, // 5MB
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpload = useCallback(async () => {
    if (!file) return;
    
    try {
      setUploading(true);
      setProgress(10);
      setError(null);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      const url = await onUpload(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      setSuccess(true);
      
      if (onUploaded) {
        onUploaded(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }, [file, onUpload, onUploaded]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setError(null);
    setSuccess(false);
    setProgress(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept, 
    maxSize,
    maxFiles: 1,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      if (rejection?.errors[0]?.code === 'file-too-large') {
        setError(`File is too large. Max size is ${maxSize / 1024 / 1024}MB`);
      } else if (rejection?.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type');
      } else {
        setError('Error uploading file');
      }
    }
  });

  const reset = () => {
    setFile(null);
    setProgress(0);
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}
          ${error ? 'border-red-500 bg-red-50' : ''}
          ${success ? 'border-green-500 bg-green-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        {!file ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragActive
                ? "Drop the file here"
                : "Drag & drop a file here, or click to select"}
            </p>
            <p className="text-xs text-gray-400">
              Supported formats: PDF, DOC, DOCX, JPG, PNG (max {maxSize / 1024 / 1024}MB)
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2">
              {success ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Upload className="h-5 w-5 text-gray-500" />
              )}
              <span className="font-medium text-sm">{file.name}</span>
              {!uploading && (
                <Button type="button" variant="ghost" size="icon" onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {file && !success && (
        <>
          {progress > 0 && (
            <Progress value={progress} className="h-2 w-full" />
          )}
          <Button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </>
      )}
    </div>
  );
};

export default FileUploader;
