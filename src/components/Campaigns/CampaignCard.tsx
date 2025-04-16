import React from 'react';
import { format } from 'date-fns';
import { Calendar, Tag } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export type Campaign = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  company_id: string;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

interface CampaignCardProps {
  campaign: Campaign;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const navigate = useNavigate();

  return (
    <Card className="cursor-pointer" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
      <CardHeader className="pb-2">
        <CardTitle>{campaign.name}</CardTitle>
        <CardDescription>{campaign.description || 'No description'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500">
          Last updated: {formatDate(campaign.updated_at)}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className={`inline-flex items-center rounded-full ${getStatusBadgeColor(campaign.status)} px-2.5 py-0.5 text-xs font-medium`}>
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </span>
          <Button variant="link" className="text-blue-600 hover:text-blue-800">
            View Details
          </Button>
        </div>
        {campaign.budget && (
          <div className="mt-2 flex items-center text-sm">
            <Tag className="h-4 w-4 mr-1 text-gray-500" />
            Budget: ${campaign.budget}
          </div>
        )}
        {campaign.start_date && (
          <div className="mt-2 flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-1 text-gray-500" />
            {formatDate(campaign.start_date)} to {formatDate(campaign.end_date)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
