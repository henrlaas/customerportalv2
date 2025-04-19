
import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { PlatformBadge } from './PlatformBadge';
import { Campaign } from './types/campaign';
import { EditCampaignDialog } from './EditCampaignDialog/EditCampaignDialog';
import { DeleteCampaignDialog } from './DeleteCampaignDialog/DeleteCampaignDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface CampaignDetailsBannerProps {
  campaign: Campaign | null;
  onCampaignUpdate: () => void;
}

export function CampaignDetailsBanner({ campaign, onCampaignUpdate }: CampaignDetailsBannerProps) {
  const { toast } = useToast();

  if (!campaign) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd.MM.yyyy');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-yellow-100 text-yellow-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'Draft';
      case 'in-progress':
        return 'In Progress';
      case 'ready':
        return 'Ready';
      case 'published':
        return 'Published';
      case 'archived':
        return 'Archived';
      default:
        return status;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', campaign.id);

      if (error) throw error;

      toast({
        title: 'Status updated',
        description: `Campaign status has been updated to ${formatStatus(newStatus)}`,
      });
      
      onCampaignUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update campaign status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="bg-card border-b mb-6">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {campaign.companies?.logo_url && (
              <Avatar className="h-12 w-12">
                <AvatarImage src={campaign.companies.logo_url} alt={campaign.companies?.name || 'Company logo'} />
                <AvatarFallback>{campaign.companies?.name?.charAt(0) || 'C'}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <h1 className="text-2xl font-bold mb-1">{campaign.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {campaign.companies?.name && (
                  <span>{campaign.companies.name}</span>
                )}
                {campaign.platform && (
                  <>
                    <span>•</span>
                    <PlatformBadge platform={campaign.platform} showLabel />
                  </>
                )}
                <span>•</span>
                <span>
                  {campaign.is_ongoing ? 
                    'Ongoing Campaign' : 
                    `${formatDate(campaign.start_date)} - ${formatDate(campaign.end_date)}`
                  }
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(campaign.status)}>
              {formatStatus(campaign.status)}
            </Badge>
            
            <Select
              defaultValue={campaign.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <EditCampaignDialog 
              campaign={campaign} 
              trigger={
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              } 
            />

            <DeleteCampaignDialog 
              campaign={campaign}
              trigger={
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                  <Trash2 className="h-4 w-4" />
                </Button>
              } 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
