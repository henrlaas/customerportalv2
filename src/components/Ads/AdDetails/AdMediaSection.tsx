
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, RotateCcw } from 'lucide-react';
import { AdMediaViewer } from './AdMediaViewer';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface MediaSectionProps {
  adId: string;
  fileUrl?: string;
  fileType?: string;
  comments: any[];
  onCommentAdd: (comment: { x: number; y: number; text: string }) => void;
  onCommentResolve: (commentId: string) => void;
  canReupload?: boolean;
}

export function AdMediaSection({ 
  adId, 
  fileUrl, 
  fileType, 
  comments, 
  onCommentAdd, 
  onCommentResolve,
  canReupload = false
}: MediaSectionProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const unresolvedComments = comments.filter(c => !c.isResolved);
  const hasUnresolvedComments = unresolvedComments.length > 0;

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId) throw new Error("User not authenticated");
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${adId}-${Date.now()}.${fileExt}`;
      const filePath = `ads/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ad-media')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('ad-media')
        .getPublicUrl(filePath);
      
      const newFileUrl = urlData.publicUrl;
      let adType: 'image' | 'video' | 'text' = 'text';
      
      if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '')) {
        adType = 'image';
      } else if (['mp4', 'webm', 'mov'].includes(fileExt || '')) {
        adType = 'video';
      }
      
      // Update ad with new file URL
      const { error: updateError } = await supabase
        .from('ads')
        .update({
          file_url: newFileUrl,
          file_type: adType
        })
        .eq('id', adId);
      
      if (updateError) throw updateError;
      
      // Create media upload record
      const { error: mediaError } = await supabase
        .from('media_uploads')
        .insert({
          ad_id: adId,
          file_url: newFileUrl,
          file_type: adType,
          file_name: file.name,
          file_size: file.size,
          uploaded_by: userId
        });
      
      if (mediaError) throw mediaError;
    },
    onSuccess: () => {
      toast({ 
        title: 'Media uploaded',
        description: 'The new media has been uploaded successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['ad', adId] });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: any) => {
      toast({ 
        title: 'Upload failed', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
    onSettled: () => {
      setUploading(false);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploading(true);
    uploadMutation.mutate(file);
  };

  if (!fileUrl || !fileType || fileType === 'text') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Media Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              No media uploaded for this ad
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Media'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,video/*"
              onChange={handleFileChange}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Media</CardTitle>
          {canReupload && !hasUnresolvedComments && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Replace Media'}
            </Button>
          )}
          {hasUnresolvedComments && (
            <div className="text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
              Resolve comments before replacing media
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <AdMediaViewer
          fileUrl={fileUrl}
          fileType={fileType}
          adId={adId}
          comments={comments}
          onCommentAdd={onCommentAdd}
          onCommentResolve={onCommentResolve}
        />
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*"
          onChange={handleFileChange}
        />
      </CardContent>
    </Card>
  );
}
