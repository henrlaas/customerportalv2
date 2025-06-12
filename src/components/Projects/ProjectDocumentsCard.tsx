import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, Trash2, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileUploader } from '@/components/FileUploader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProjectDocumentsCardProps {
  projectId: string;
}

export const ProjectDocumentsCard: React.FC<ProjectDocumentsCardProps> = ({
  projectId
}) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['project-documents', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching project documents:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!projectId
  });

  const uploadDocument = useMutation({
    mutationFn: async (file: File) => {
      // Upload file to storage with proper file path structure
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${Date.now()}_${file.name}`;

      console.log('Uploading file to path:', fileName);

      const { error: uploadError } = await supabase.storage
        .from('project-documents')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('project-documents')
        .getPublicUrl(fileName);

      console.log('File uploaded successfully, URL:', urlData.publicUrl);

      // Save document record
      const { data, error } = await supabase
        .from('project_documents')
        .insert({
          project_id: projectId,
          name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          file_type: file.type
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving document record:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['project-documents', projectId] });
      setIsUploadDialogOpen(false);
    },
    onError: (error: any) => {
      console.error('Error uploading document:', error);
      toast.error(`Failed to upload document: ${error.message}`);
    }
  });

  const deleteDocument = useMutation({
    mutationFn: async (document: any) => {
      // Extract file name from URL or use stored path
      const filePath = `${projectId}/${document.name}`;
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('project-documents')
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Don't throw here as the file might not exist in storage
      }

      // Delete record from database
      const { error } = await supabase
        .from('project_documents')
        .delete()
        .eq('id', document.id);

      if (error) {
        console.error('Error deleting document record:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Document deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['project-documents', projectId] });
    },
    onError: (error: any) => {
      console.error('Error deleting document:', error);
      toast.error(`Failed to delete document: ${error.message}`);
    }
  });

  const downloadDocument = (document: any) => {
    window.open(document.file_url, '_blank');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    return '📁';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">
            <p className="text-gray-500">Loading documents...</p>
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="space-y-3">
            {documents.slice(0, 3).map((document) => (
              <div
                key={document.id}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getFileIcon(document.file_type)}</span>
                      <p className="font-medium text-sm truncate" title={document.name}>
                        {document.name}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(document.file_size)} • {new Date(document.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadDocument(document)}
                      className="h-6 w-6 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteDocument.mutate(document)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      disabled={deleteDocument.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {documents.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                +{documents.length - 3} more documents
              </p>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUploadDialogOpen(true)}
              className="w-full mt-3"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 mb-4 text-sm">No documents uploaded yet</p>
            <Button 
              size="sm" 
              onClick={() => setIsUploadDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        )}
      </CardContent>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <FileUploader
              onUpload={async (file) => {
                await uploadDocument.mutateAsync(file);
                return file.name; // Return the file name as a string
              }}
              accept={{
                'application/pdf': ['.pdf'],
                'application/msword': ['.doc'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                'application/vnd.ms-excel': ['.xls'],
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                'image/jpeg': ['.jpg', '.jpeg'],
                'image/png': ['.png'],
                'text/plain': ['.txt']
              }}
              maxSize={10485760} // 10MB
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
