
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdCommentMarker } from './AdCommentMarker';
import { useToast } from '@/components/ui/use-toast';
import { Check, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
}

export function AdMediaViewer({ 
  fileUrl, 
  fileType, 
  adId, 
  comments = [], 
  onCommentAdd,
  onCommentResolve,
  isApproved = false
}: AdMediaViewerProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [newComment, setNewComment] = useState<Omit<Comment, 'id'> | null>(null);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const { toast } = useToast();

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

  const handleMediaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCommenting || isApproved) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setNewComment({ x, y, text: '' });
  };

  const handleCommentSubmit = (text: string) => {
    if (!newComment || isApproved) return;
    
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

  return (
    <div className="grid grid-cols-[2fr,1fr] gap-6">
      <div>
        <Card className="overflow-hidden">
          <div 
            className={`relative ${!isApproved ? 'cursor-crosshair' : 'cursor-default'}`}
            onClick={handleMediaClick}
          >
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
            
            {newComment && !isApproved && (
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
          {!isApproved ? (
            <Button
              variant={isCommenting ? "secondary" : "outline"}
              onClick={() => setIsCommenting(!isCommenting)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {isCommenting ? "Cancel" : "Add Comment"}
            </Button>
          ) : (
            <div className="text-sm text-muted-foreground bg-blue-50 px-3 py-2 rounded">
              This ad is approved. Comments cannot be added.
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
                      <p className="text-sm">{comment.text}</p>
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
  );
}
