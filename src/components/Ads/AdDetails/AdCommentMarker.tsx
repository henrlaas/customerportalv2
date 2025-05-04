
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdCommentMarkerProps {
  x: number;
  y: number;
  comment: string;
  isNew?: boolean;
  isResolved?: boolean;
  onClick?: () => void;
  onResolve?: () => void;
}

export function AdCommentMarker({ 
  x, 
  y, 
  comment, 
  isNew, 
  isResolved,
  onClick, 
  onResolve 
}: AdCommentMarkerProps) {
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
          size="icon" 
          variant={isResolved ? "primary" : isNew ? "primary" : "secondary"}
          className={cn(
            "rounded-full w-8 h-8 p-0",
            isResolved && "bg-green-500 hover:bg-green-600"
          )}
        >
          {isResolved ? (
            <Check className="w-4 h-4" />
          ) : (
            <MessageSquare className="w-4 h-4" />
          )}
        </Button>
        {(isHovered || isNew) && comment && (
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-10">
            <Badge 
              variant="secondary"
              className={cn(
                "whitespace-nowrap",
                isResolved && "bg-green-500"
              )}
            >
              {comment}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
