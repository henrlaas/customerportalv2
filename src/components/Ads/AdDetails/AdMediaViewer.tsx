import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdCommentMarker } from './AdCommentMarker';
import { useToast } from '@/components/ui/use-toast';

interface Comment {
  x: number;
  y: number;
  text: string;
  id?: string;
}

interface AdMediaViewerProps {
  fileUrl: string;
  fileType: string;
  adId: string;
  comments: Comment[];
  onCommentAdd: (comment: Omit<Comment, 'id'>) => void;
}

export function AdMediaViewer({ fileUrl, fileType, adId, comments = [], onCommentAdd }: AdMediaViewerProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [newComment, setNewComment] = useState<Omit<Comment, 'id'> | null>(null);
  const { toast } = useToast();

  const handleMediaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCommenting) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setNewComment({ x, y, text: '' });
  };

  const handleCommentSubmit = (text: string) => {
    if (!newComment) return;
    
    onCommentAdd({ ...newComment, text });
    setNewComment(null);
    setIsCommenting(false);
    toast({ title: "Comment added" });
  };

  return (
    <div className="relative">
      <Card className="overflow-hidden">
        <div 
          className="relative cursor-crosshair"
          onClick={handleMediaClick}
        >
          {fileType === 'image' ? (
            <img 
              src={fileUrl} 
              alt="Ad content"
              className="w-full max-h-[600px] object-contain bg-muted"
            />
          ) : (
            <video 
              src={fileUrl} 
              controls 
              className="w-full max-h-[600px] object-contain bg-muted"
            />
          )}
          
          {/* Existing comments */}
          {comments.map((comment, idx) => (
            <AdCommentMarker
              key={comment.id || idx}
              x={comment.x}
              y={comment.y}
              comment={comment.text}
            />
          ))}
          
          {/* New comment being added */}
          {newComment && (
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
        <Button
          variant={isCommenting ? "secondary" : "outline"}
          onClick={() => setIsCommenting(!isCommenting)}
        >
          {isCommenting ? "Cancel" : "Add Comment"}
        </Button>
      </div>
    </div>
  );
}
