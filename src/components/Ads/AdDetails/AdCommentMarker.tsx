
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
      className="absolute cursor-pointer z-20"
      style={{ left: `${x}%`, top: `${y}%` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative">
        {/* Enhanced marker with better visibility */}
        <div className="relative">
          {/* Shadow/backdrop for visibility */}
          <div className="absolute inset-0 bg-black/20 rounded-full blur-sm transform scale-110" />
          
          {/* Main marker button */}
          <Button 
            size="sm" 
            variant={isResolved ? "default" : isNew ? "default" : "secondary"}
            className={cn(
              "relative rounded-full w-10 h-10 p-0 border-2 border-white shadow-lg",
              "hover:scale-110 transition-all duration-200",
              isResolved && "bg-green-500 hover:bg-green-600 border-green-200",
              isNew && "bg-blue-500 hover:bg-blue-600 border-blue-200 animate-pulse",
              !isResolved && !isNew && "bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
            )}
          >
            {isResolved ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <MessageSquare className={cn(
                "w-5 h-5",
                isNew ? "text-white" : "text-gray-700"
              )} />
            )}
          </Button>
        </div>
        
        {/* Comment tooltip */}
        {(isHovered || isNew) && comment && (
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-30 max-w-xs">
            {/* Tooltip arrow */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0 h-0 
                            border-t-[6px] border-t-transparent 
                            border-b-[6px] border-b-transparent 
                            border-r-[6px] border-r-white" />
            
            {/* Tooltip content */}
            <div className={cn(
              "bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg",
              "text-sm text-gray-800 max-w-xs break-words",
              isResolved && "bg-green-50 border-green-200 text-green-800"
            )}>
              {comment}
              {is‌Resolved && (
                <div className="text-xs text-green-600 mt-1 font-medium">
                  ✓ Resolved
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
