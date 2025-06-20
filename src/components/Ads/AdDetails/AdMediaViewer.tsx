
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdCommentMarker } from './AdCommentMarker';
import { useToast } from '@/components/ui/use-toast';
import { Check, MessageSquare, ZoomIn, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Comment {
  x: number;
  y: number;
  text: string;
  id?: string;
  isResolved?: boolean;
  user_id?: string;
}

interface AdMediaViewerProps {
  fileUrl: string;
  fileType: string;
  adId: string;
  comments: Comment[];
  onCommentAdd: (comment: Omit<Comment, 'id'>) => void;
  onCommentResolve: (commentId: string) => void;
  isApproved?: boolean;
  isCampaignLocked?: boolean;
}

export function AdMediaViewer({ 
  fileUrl, 
  fileType, 
  adId, 
  comments = [], 
  onCommentAdd,
  onCommentResolve,
  isApproved = false,
  isCampaignLocked = false
}: AdMediaViewerProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [newComment, setNewComment] = useState<Omit<Comment, 'id'> | null>(null);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [showZoomDialog, setShowZoomDialog] = useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Check if user can delete comments (admin or employee)
  const canDeleteComments = profile?.role === 'admin' || profile?.role === 'employee';

  // Fetch user profiles for comments
  const userIds = comments.map(c => c.user_id).filter(Boolean);
  const { data: userProfiles = [] } = useQuery({
    queryKey: ['user_profiles', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return [];
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, avatar_url')
        .in('id', userIds);
      return data || [];
    },
    enabled: userIds.length > 0,
  });

  const getUserProfile = (userId: string) => {
    const profile = userProfiles.find(p => p.id === userId);
    return {
      firstName: profile?.first_name || 'Unknown User',
      avatarUrl: profile?.avatar_url,
      initials: profile?.first_name ? profile.first_name.charAt(0).toUpperCase() : 'U'
    };
  };

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('ad_comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Comment deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['ad_comments', adId] });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to delete comment', description: error.message, variant: 'destructive' });
    }
  });

  const handleMediaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCommenting || isApproved || isCampaignLocked) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setNewComment({ x, y, text: '' });
  };

  const handleCommentSubmit = (text: string) => {
    if (!newComment || isApproved || isCampaignLocked) return;
    
    onCommentAdd({ ...newComment, text });
    setNewComment(null);
    setIsCommenting(false);
    toast({ title: "Comment added" });
  };

  // Helper function to determine if the file is an image
  const isImageFile = (type: string, url: string) => {
    const imageTypes = ['image', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const lowerType = type?.toLowerCase() || '';
    const urlExtension = url?.split('.').pop()?.toLowerCase() || '';
    
    return imageTypes.includes(lowerType) || imageTypes.includes(urlExtension);
  };

  // Helper function to determine if the file is a video
  const isVideoFile = (type: string, url: string) => {
    const videoTypes = ['video', 'mp4', 'webm', 'mov', 'avi', 'mkv'];
    const lowerType = type?.toLowerCase() || '';
    const urlExtension = url?.split('.').pop()?.toLowerCase() || '';
    
    return videoTypes.includes(lowerType) || videoTypes.includes(urlExtension);
  };

  const commentsDisabled = isApproved || isCampaignLocked;
  const disabledReason = isApproved 
    ? "This ad is approved. Comments cannot be added." 
    : "Comments cannot be added when the campaign is ready, published, or archived.";

  return (
    <>
      <div className="grid grid-cols-[2fr,1fr] gap-6">
        <div>
          <Card className="overflow-hidden">
            <div 
              className={`relative ${!commentsDisabled ? 'cursor-crosshair' : 'cursor-default'}`}
              onClick={handleMediaClick}
            >
              {/* Zoom Button */}
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 z-10 h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowZoomDialog(true);
                }}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              {isImageFile(fileType, fileUrl) ? (
                <img 
                  src={fileUrl} 
                  alt="Ad content"
                  className="w-full h-[400px] object-contain bg-muted"
                  onError={(e) => {
                    console.error('Failed to load image:', fileUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : isVideoFile(fileType, fileUrl) ? (
                <video 
                  src={fileUrl} 
                  controls 
                  className="w-full h-[400px] object-contain bg-muted"
                  onError={(e) => {
                    console.error('Failed to load video:', fileUrl);
                  }}
                />
              ) : (
                <div className="w-full h-[400px] bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground">Media format not supported</p>
                    <p className="text-sm text-muted-foreground mt-2">File type: {fileType}</p>
                  </div>
                </div>
              )}
              
              {comments.map((comment, idx) => (
                <AdCommentMarker
                  key={comment.id || idx}
                  x={comment.x}
                  y={comment.y}
                  comment={comment.text}
                  isResolved={comment.isResolved}
                  onClick={() => setSelectedComment(comment.id)}
                />
              ))}
              
              {newComment && !commentsDisabled && (
                <div className="absolute" style={{ left: `${newComment.x}%`, top: `${newComment.y}%` }}>
                  <input
                    autoFocus
                    type="text"
                    className="ml-2 p-1 text-sm border rounded"
                    placeholder="Add comment..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCommentSubmit(e.currentTarget.value);
                      }
                    }}
                    onBlur={(e) => handleCommentSubmit(e.target.value)}
                  />
                </div>
              )}
            </div>
          </Card>
          
          <div className="mt-4 flex justify-end">
            {!commentsDisabled ? (
              <Button
                variant={isCommenting ? "secondary" : "outline"}
                onClick={() => setIsCommenting(!isCommenting)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {isCommenting ? "Cancel" : "Add Comment"}
              </Button>
            ) : (
              <div className="text-sm text-muted-foreground bg-blue-50 px-3 py-2 rounded">
                {disabledReason}
              </div>
            )}
          </div>
        </div>

        <Card className="h-[500px] flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Comments</h3>
            <div className="text-sm text-muted-foreground mt-1">
              {comments.filter(c => !c.isResolved).length} active &bull; {comments.filter(c => c.isResolved).length} resolved
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {comments.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No comments yet
                </div>
              ) : (
                comments.map((comment) => {
                  const userProfile = getUserProfile(comment.user_id || '');
                  return (
                    <div 
                      key={comment.id} 
                      className={`border rounded-lg p-3 transition-colors ${
                        selectedComment === comment.id ? 'border-primary' : ''
                      } ${comment.isResolved ? 'bg-muted/50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm flex-1">{comment.text}</p>
                        <div className="flex items-center gap-1">
                          {!comment.isResolved && comment.id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => onCommentResolve(comment.id!)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          {canDeleteComments && comment.id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 hover:text-red-600"
                              onClick={() => deleteCommentMutation.mutate(comment.id!)}
                              disabled={deleteCommentMutation.isPending}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={userProfile.avatarUrl || undefined} />
                          <AvatarFallback className="text-xs">{userProfile.initials}</AvatarFallback>
                        </Avatar>
                        <span>{userProfile.firstName}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Zoom Dialog */}
      <Dialog open={showZoomDialog} onOpenChange={setShowZoomDialog}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Media Preview</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            {isImageFile(fileType, fileUrl) ? (
              <img 
                src={fileUrl} 
                alt="Ad content - zoomed"
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  console.error('Failed to load image:', fileUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : isVideoFile(fileType, fileUrl) ? (
              <video 
                src={fileUrl} 
                controls 
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  console.error('Failed to load video:', fileUrl);
                }}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Media format not supported</p>
                <p className="text-sm text-muted-foreground mt-2">File type: {fileType}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
