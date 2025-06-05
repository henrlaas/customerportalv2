
import React, { useState } from 'react';
import { Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { DealNote } from '../types/dealNotes';
import { Profile } from '../types/deal';
import { formatDistanceToNow } from 'date-fns';

interface DealNoteItemProps {
  note: DealNote;
  profiles: Profile[];
  canModify: boolean;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export const DealNoteItem: React.FC<DealNoteItemProps> = ({
  note,
  profiles,
  canModify,
  onUpdate,
  onDelete,
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  const author = profiles.find(p => p.id === note.user_id);
  const authorName = author 
    ? `${author.first_name || ''} ${author.last_name || ''}`.trim() || 'Unknown User'
    : 'Unknown User';

  const getInitials = (profile: Profile | undefined) => {
    if (!profile) return 'U';
    const first = profile.first_name?.[0] || '';
    const last = profile.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  const canEdit = canModify && (user?.id === note.user_id);
  const canDelete = canModify && (user?.id === note.user_id);

  const handleSave = () => {
    if (editContent.trim() !== note.content) {
      onUpdate(note.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2 min-h-fit">
      <div className="flex justify-between items-start">
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={author?.avatar_url || undefined} alt={authorName} />
            <AvatarFallback className="text-xs">{getInitials(author)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{authorName}</span>
          <span className="mx-2">•</span>
          <span>{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
        </div>
        {(canEdit || canDelete) && !isEditing && (
          <div className="flex gap-1">
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-6 w-6 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(note.id)}
                className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
        {isEditing && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      
      {isEditing ? (
        <Textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="min-h-[60px] text-sm resize-y"
          autoFocus
        />
      ) : (
        <div className="text-sm text-gray-800 whitespace-pre-wrap break-words overflow-wrap-anywhere">
          {note.content}
        </div>
      )}
    </div>
  );
};
