
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  accept?: Record<string, string[]>; 
  maxSize?: number;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  },
  maxSize = 5242880, // 5MB
  disabled = false
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    disabled,
    multiple: false
  });

  // Check for file rejection reasons
  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <div key={file.name} className="text-xs text-red-500">
      {errors.map(error => (
        <p key={error.code}>{error.message}</p>
      ))}
    </div>
  ));

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-6 cursor-pointer text-center transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'} 
          ${isDragReject ? 'border-red-500 bg-red-50' : ''}
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? "Drop the file here..."
            : "Drag & drop a file here, or click to select"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PDF, DOC, DOCX up to 5MB
        </p>
      </div>
      {fileRejectionItems.length > 0 && (
        <div className="mt-2">{fileRejectionItems}</div>
      )}
    </div>
  );
};
