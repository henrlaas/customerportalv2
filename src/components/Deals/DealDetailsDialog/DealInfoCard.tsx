
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Calendar, FileText } from 'lucide-react';
import { Deal } from '../types/deal';
import { format } from 'date-fns';

interface DealInfoCardProps {
  deal: Deal;
}

export const DealInfoCard: React.FC<DealInfoCardProps> = ({ deal }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Deal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {deal.description && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description
            </h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {deal.description}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500">Deal Type</span>
            <div className="mt-1">
              <Badge variant={deal.deal_type === 'recurring' ? 'default' : 'outline'}>
                {deal.deal_type === 'recurring' ? 'Recurring' : 'One-time'}
              </Badge>
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500">Client Type</span>
            <div className="mt-1">
              <Badge variant="secondary">
                {deal.client_deal_type === 'web' ? 'Web Development' : 'Marketing'}
              </Badge>
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-500">Created</span>
            <p className="text-sm text-gray-900 mt-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(deal.created_at), 'MMM d, yyyy')}
            </p>
          </div>
          
          {deal.expected_close_date && (
            <div>
              <span className="text-sm font-medium text-gray-500">Expected Close</span>
              <p className="text-sm text-gray-900 mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(deal.expected_close_date), 'MMM d, yyyy')}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
