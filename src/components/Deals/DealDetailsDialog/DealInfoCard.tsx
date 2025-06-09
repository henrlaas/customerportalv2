
import React from 'react';
import { FileText, Calendar, Percent, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Deal } from '@/components/Deals/types/deal';
import { format } from 'date-fns';

interface DealInfoCardProps {
  deal: Deal;
}

export const DealInfoCard: React.FC<DealInfoCardProps> = ({ deal }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Deal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        {deal.description && (
          <div>
            <h5 className="font-medium mb-2">Description</h5>
            <p className="text-sm text-muted-foreground leading-relaxed p-3 bg-muted/50 rounded">
              {deal.description}
            </p>
          </div>
        )}

        {/* Deal Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-3 w-3" />
              Deal Type
            </div>
            <p className="font-medium capitalize">{deal.deal_type || 'Not specified'}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-3 w-3" />
              Client Type
            </div>
            <p className="font-medium capitalize">{deal.client_deal_type || 'Not specified'}</p>
          </div>

          {deal.probability !== null && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Percent className="h-3 w-3" />
                Probability
              </div>
              <p className="font-medium">{deal.probability}%</p>
            </div>
          )}

          {deal.expected_close_date && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Expected Close
              </div>
              <p className="font-medium">{formatDate(deal.expected_close_date)}</p>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Created
            </div>
            <p className="font-medium">{formatDate(deal.created_at)}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Last Updated
            </div>
            <p className="font-medium">{formatDate(deal.updated_at)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
