
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { DealNotesList } from '../DealNotes/DealNotesList';
import { Profile } from '../types/deal';

interface DealNotesSectionProps {
  dealId: string;
  profiles: Profile[];
  canModify: boolean;
}

export const DealNotesSection: React.FC<DealNotesSectionProps> = ({
  dealId,
  profiles,
  canModify,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Notes & Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DealNotesList
          dealId={dealId}
          profiles={profiles}
          canModify={canModify}
        />
      </CardContent>
    </Card>
  );
};
