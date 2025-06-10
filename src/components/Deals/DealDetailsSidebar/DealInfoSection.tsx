
import React from 'react';
import { User, Calendar, Repeat, CircleDollarSign, Globe, Megaphone, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Deal, Profile } from '../types/deal';
import { getAssigneeName, formatDate } from '../utils/formatters';

interface DealInfoSectionProps {
  deal: Deal;
  profiles: Profile[];
}

export const DealInfoSection = ({ deal, profiles }: DealInfoSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Deal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Deal Description */}
        {deal.description && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Description</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{deal.description}</p>
          </div>
        )}

        {/* Deal Types */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Deal Type:</span>
            <Badge variant="outline" className="flex items-center gap-1">
              {deal.deal_type === 'recurring' ? (
                <Repeat className="h-3 w-3" />
              ) : (
                <CircleDollarSign className="h-3 w-3" />
              )}
              <span className="capitalize">{deal.deal_type || 'N/A'}</span>
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Client Type:</span>
            <Badge variant="outline" className="flex items-center gap-1">
              {deal.client_deal_type === 'web' ? (
                <Globe className="h-3 w-3" />
              ) : (
                <Megaphone className="h-3 w-3" />
              )}
              <span className="capitalize">{deal.client_deal_type || 'N/A'}</span>
            </Badge>
          </div>
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
              <span className="text-sm">{formatDate(deal.created_at)}</span>
            </div>
          </div>
          
          {deal.expected_close_date && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Expected Close:</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{formatDate(deal.expected_close_date)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
