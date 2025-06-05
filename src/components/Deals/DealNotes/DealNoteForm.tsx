
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DealNoteFormData } from '../types/dealNotes';

interface DealNoteFormProps {
  onSubmit: (data: DealNoteFormData) => void;
  isSubmitting: boolean;
}

export const DealNoteForm: React.FC<DealNoteFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit({ content: content.trim() });
      setContent('');
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        onClick={() => setIsExpanded(true)}
        className="w-full justify-start"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add a note...
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a note..."
        className="min-h-[80px]"
        autoFocus
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || isSubmitting}
        >
          Add Note
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setIsExpanded(false);
            setContent('');
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
