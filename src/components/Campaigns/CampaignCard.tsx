
import React from 'react';
import { format } from 'date-fns';
import { Calendar, Tag, Clock, User } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PlatformBadge } from './PlatformBadge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  platform: string | null;
  is_ongoing: boolean | null;
  associated_user_id: string | null;
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

  // Fetch associated user details if available
  const { data: associatedUser } = useQuery({
    queryKey: ['user', campaign.associated_user_id],
    queryFn: async () => {
      if (!campaign.associated_user_id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', campaign.associated_user_id)
        .single();
        
      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!campaign.associated_user_id,
  });

  return (
    <Card className="cursor-pointer" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{campaign.name}</CardTitle>
            <CardDescription>{campaign.description || 'No description'}</CardDescription>
          </div>
          {campaign.platform && (
            <PlatformBadge platform={campaign.platform} />
          )}
        </div>
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
            Budget: {campaign.budget}
          </div>
        )}
        {campaign.is_ongoing ? (
          <div className="mt-2 flex items-center text-sm">
            <Clock className="h-4 w-4 mr-1 text-gray-500" />
            Ongoing Campaign
          </div>
        ) : (
          campaign.start_date && (
            <div className="mt-2 flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
              {formatDate(campaign.start_date)} to {formatDate(campaign.end_date)}
            </div>
          )
        )}
        {associatedUser && (
          <div className="mt-2 flex items-center text-sm">
            <User className="h-4 w-4 mr-1 text-gray-500" />
            Assigned to: {associatedUser.first_name} {associatedUser.last_name}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
