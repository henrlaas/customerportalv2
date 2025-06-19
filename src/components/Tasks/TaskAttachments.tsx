import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { FileUploader } from '@/components/FileUploader';
import { 
  FileText, 
  Image as ImageIcon,
  File,
  Download,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

type TaskAttachment = {
  id: string;
  task_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  created_at: string | null;
  created_by: string | null;
};

interface TaskAttachmentsProps {
  taskId: string;
}

export const TaskAttachments: React.FC<TaskAttachmentsProps> = ({ taskId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Fetch attachments
  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['task-attachments', taskId],
    queryFn: async () => {
      // Cast to any first to allow using "task_attachments" table
      const { data, error } = await (supabase as any)
        .from('task_attachments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: 'Error fetching attachments',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
      
      return data as TaskAttachment[];
    },
  });
  
  // Handle file upload
  const handleUpload = async (file: File) => {
    try {
      // Get current user ID
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // Generate a unique filename to prevent collisions
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${file.name}`;
      const filePath = `task-attachments/${taskId}/${fileName}`;
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get file URL
      const { data: publicUrlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);
      
      // Create database record
      const { error: insertError } = await (supabase as any)
        .from('task_attachments')
        .insert({
          task_id: taskId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          file_url: publicUrlData.publicUrl,
          created_by: userId
        });
      
      if (insertError) throw insertError;
      
      // Refresh attachments list
      queryClient.invalidateQueries({ queryKey: ['task-attachments', taskId] });
      
      return publicUrlData.publicUrl;
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'There was a problem uploading your file',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  // Delete attachment mutation
  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      // Get the attachment details first
      const { data: attachment, error: fetchError } = await (supabase as any)
        .from('task_attachments')
        .select('file_url')
        .eq('id', attachmentId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Extract path from URL
      const fileUrl = attachment.file_url as string;
      const path = fileUrl.split('/').slice(-2).join('/');
      
      // Delete from storage first (best effort, don't block if fails)
      try {
        await supabase.storage
          .from('attachments')
          .remove([path]);
      } catch (error) {
        console.error('Failed to delete file from storage:', error);
      }
      
      // Delete database record
      const { error: deleteError } = await (supabase as any)
        .from('task_attachments')
        .delete()
        .eq('id', attachmentId);
        
      if (deleteError) throw deleteError;
      
      return true;
    },
    onSuccess: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ['task-attachments', taskId] });
      toast({
        title: 'Attachment deleted',
        description: 'The file has been removed',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete failed',
        description: error.message || 'There was a problem deleting your file',
        variant: 'destructive',
      });
      setDeletingId(null);
    },
  });
  
  // Helper to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Helper to get icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
  };
  
  // Handle deleting an attachment
  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteAttachmentMutation.mutate(id);
  };
  
  // Handle downloading/viewing an attachment - always opens in new tab
  const handleDownload = (url: string, fileName: string) => {
    window.open(url, '_blank');
  };

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {attachments.length} attachment{attachments.length !== 1 ? 's' : ''}
        </h3>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Upload File</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Attachment</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <FileUploader
                onUpload={handleUpload}
                onUploaded={() => {
                  setIsUploadOpen(false);
                  toast({
                    title: 'File uploaded',
                    description: 'Your file has been uploaded successfully',
                  });
                }}
                accept={{
                  'application/pdf': ['.pdf'],
                  'application/msword': ['.doc'],
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                  'image/jpeg': ['.jpg', '.jpeg'],
                  'image/png': ['.png'],
                  'application/zip': ['.zip'],
                  'video/mp4': ['.mp4'],
                  'video/quicktime': ['.mov'],
                }}
                maxSize={50 * 1024 * 1024} // 50MB
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="text-center py-6">
          <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading attachments...</p>
        </div>
      ) : attachments.length === 0 ? (
        <div className="text-center py-6 border border-dashed rounded-md">
          <File className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">No attachments yet</p>
          <Button size="sm" variant="outline" onClick={() => setIsUploadOpen(true)}>Upload File</Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {attachments.map(attachment => (
            <li 
              key={attachment.id} 
              className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50"
            >
              <div className="flex items-center">
                <div className="mr-3 text-muted-foreground">
                  {getFileIcon(attachment.file_type)}
                </div>
                <div>
                  <p className="font-medium truncate max-w-[200px] sm:max-w-[300px]">{attachment.file_name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(attachment.file_size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={() => handleDownload(attachment.file_url, attachment.file_name)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(attachment.id)}
                  disabled={deletingId === attachment.id}
                >
                  {deletingId === attachment.id ? (
                    <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskAttachments;
