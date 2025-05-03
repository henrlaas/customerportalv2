
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Paperclip, File, Download, Trash2, Plus } from 'lucide-react';
import { formatBytes } from '@/utils/helpers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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

type TaskAttachmentsProps = {
  taskId: string;
};

export const TaskAttachments = ({ taskId }: TaskAttachmentsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch task attachments
  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['taskAttachments', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
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
    enabled: !!taskId
  });

  // Delete attachment mutation
  const deleteAttachment = useMutation({
    mutationFn: async (attachmentId: string) => {
      // First get the attachment details
      const { data: attachment, error: fetchError } = await supabase
        .from('task_attachments')
        .select('file_url')
        .eq('id', attachmentId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Delete from storage if necessary (this would require storage setup)
      // We'll skip this part for now and focus on database deletion
      
      // Delete from database
      const { error: deleteError } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachmentId);
      
      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskAttachments', taskId] });
      toast({
        title: 'Attachment deleted'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting attachment',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Handle file upload
  const handleUpload = async () => {
    if (!uploadFile) return;
    
    setIsUploading(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // For demonstration, we'll use a direct URL approach
      // In a real implementation, you would upload to Supabase Storage
      const fileUrl = URL.createObjectURL(uploadFile);
      
      // Store attachment metadata in database
      const { data, error } = await supabase
        .from('task_attachments')
        .insert({
          task_id: taskId,
          file_name: uploadFile.name,
          file_size: uploadFile.size,
          file_type: uploadFile.type,
          file_url: fileUrl, // In real implementation, this would be a storage URL
          created_by: userId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['taskAttachments', taskId] });
      toast({
        title: 'File uploaded',
        description: `${uploadFile.name} has been uploaded successfully`
      });
      
      setIsUploadDialogOpen(false);
      setUploadFile(null);
    } catch (error: any) {
      toast({
        title: 'Error uploading file',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <img src={fileType} className="h-8 w-8 object-cover rounded" />;
    }
    return <File className="h-8 w-8" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">Attachments</h3>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add file
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload attachment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleUpload}
                  disabled={!uploadFile || isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      ) : attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No attachments</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-2 rounded-md border bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {getFileIcon(attachment.file_type)}
                </div>
                <div>
                  <p className="font-medium text-sm">{attachment.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(attachment.file_size)} • {new Date(attachment.created_at || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(attachment.file_url, '_blank')}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAttachment.mutate(attachment.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
