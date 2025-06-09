
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Deal, Profile } from '../types/deal';
import { User, Calendar, Repeat, CircleDollarSign, Globe, Megaphone, Info } from 'lucide-react';
import { getAssigneeName } from '../utils/formatters';
import { format } from 'date-fns';

interface DealInfoSectionProps {
  deal: Deal;
  profiles: Profile[];
}

export const DealInfoSection: React.FC<DealInfoSectionProps> = ({
  deal,
  profiles,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Deal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Description */}
        {deal.description && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {deal.description}
            </p>
          </div>
        )}

        {/* Deal Types */}
        <div className="flex flex-wrap gap-2">
          {deal.deal_type && (
            <Badge variant="outline" className="flex items-center gap-1">
              {deal.deal_type === 'recurring' ? (
                <Repeat className="h-3 w-3" />
              ) : (
                <CircleDollarSign className="h-3 w-3" />
              )}
              {deal.deal_type === 'recurring' ? 'Recurring' : 'One-time'}
            </Badge>
          )}
          
          {deal.client_deal_type && (
            <Badge variant="outline" className="flex items-center gap-1">
              {deal.client_deal_type === 'web' ? (
                <Globe className="h-3 w-3" />
              ) : (
                <Megaphone className="h-3 w-3" />
              )}
              {deal.client_deal_type === 'web' ? 'Web' : 'Marketing'}
            </Badge>
          )}
        </div>

        {/* Assigned To */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Assigned To:</span>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium">
              {getAssigneeName(deal.assigned_to, profiles)}
            </span>
          </div>
        </div>

        {/* Important Dates */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Created:</span>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                {format(new Date(deal.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          
          {deal.expected_close_date && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Expected Close:</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                  {format(new Date(deal.expected_close_date), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Probability */}
        {deal.probability !== null && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Probability:</span>
            <span className="text-sm font-medium">
              {deal.probability}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
