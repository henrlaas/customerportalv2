
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface AdCommentMarkerProps {
  x: number;
  y: number;
  comment: string;
  isNew?: boolean;
  onClick?: () => void;
}

export function AdCommentMarker({ x, y, comment, isNew, onClick }: AdCommentMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="absolute cursor-pointer"
      style={{ left: `${x}%`, top: `${y}%` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative">
        <Button 
          size="sm" 
          variant={isNew ? "default" : "secondary"}
          className="rounded-full w-8 h-8 p-0"
        >
          <MessageSquare className="w-4 h-4" />
        </Button>
        {(isHovered || isNew) && comment && (
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-10">
            <Badge variant="secondary" className="whitespace-nowrap">
              {comment}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
