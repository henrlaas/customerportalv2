import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ArrowLeft, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { AdApprovalPanel } from '@/components/Ads/AdDetails/AdApprovalPanel';
import { AdMediaSection } from '@/components/Ads/AdDetails/AdMediaSection';
import { AdContentPreview } from '@/components/Ads/AdDetails/AdContentPreview';
import { AdCommentsPanel } from '@/components/Ads/AdDetails/AdCommentsPanel';
import { AdTextVariations } from '@/components/Ads/AdDetails/AdTextVariations';
import { EditAdDialog } from '@/components/Campaigns/Ads/EditAdDialog/EditAdDialog';
import { DeleteAdDialog } from '@/components/Campaigns/Ads/DeleteAdDialog/DeleteAdDialog';
import { Platform } from '@/components/Campaigns/types/campaign';

function AdInformationBanner({ ad, onEdit, onDelete, onReset }: { ad: any; onEdit: () => void; onDelete: () => void; onReset: () => void }) {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (ad.adsets?.campaign_id) {
      navigate(`/campaigns/${ad.adsets.campaign_id}`);
    } else {
      navigate('/campaigns');
    }
  };

  return (
    <div className="bg-card border-b mb-6">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackClick}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold mb-1">{ad.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{ad.file_type || ad.ad_type || 'Text'}</Badge>
                {ad.adsets?.name && (
                  <>
                    <span>•</span>
                    <span>{ad.adsets.name}</span>
                  </>
                )}
                {ad.adsets?.campaigns?.platform && (
                  <>
                    <span>•</span>
                    <Badge variant="outline">{ad.adsets.campaigns.platform}</Badge>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={onReset} variant="ghost" size="icon" title="Reset to Draft">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button onClick={onEdit} variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
            <Button onClick={onDelete} variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Interface to handle the conversion between database schema and our frontend Comment type
interface CommentData {
  id: string;
  ad_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  x?: number;
  y?: number;
  is_resolved?: boolean;
  comment_type?: string;
  parent_comment_id?: string;
}

// Helper to convert database comment to frontend Comment format
const mapDatabaseToComment = (comment: CommentData): any => {
  console.log('Mapping comment data:', comment); // Debug log to see actual data structure
  return {
    id: comment.id,
    x: comment.x || 50,
    y: comment.y || 50,
    text: comment.comment, // This should map the comment text
    comment: comment.comment, // Also keep this for consistency
    isResolved: comment.is_resolved || false,
    comment_type: comment.comment_type || 'general_comment',
    parent_comment_id: comment.parent_comment_id,
    created_at: comment.created_at,
    user_id: comment.user_id,
    is_resolved: comment.is_resolved || false // Ensure this is also mapped
  };
};

export default function AdDetailsPage() {
  const { adId } = useParams<{ adId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { data: ad, isLoading } = useQuery({
    queryKey: ['ad', adId],
    queryFn: async () => {
      if (!adId) return null;
      const { data } = await supabase
        .from('ads')
        .select(`
          *,
          adsets (
            id,
            name,
            campaign_id,
            campaigns (
              id,
              name,
              platform,
              status
            )
          )
        `)
        .eq('id', adId)
        .single();
      return data;
    },
    enabled: !!adId,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!adId) throw new Error('Missing adId');
      const { error } = await supabase.from('ads').delete().eq('id', adId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Ad deleted.' });
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      navigate(-1);
    },
    onError: (err: any) => {
      toast({ title: 'Failed to delete', description: err.message, variant: 'destructive' });
    }
  });

  const resetStatusMutation = useMutation({
    mutationFn: async () => {
      if (!adId) throw new Error('Missing adId');
      const { error } = await supabase
        .from('ads')
        .update({ 
          approval_status: 'draft',
          approved_by: null,
          approved_at: null,
          rejection_reason: null
        })
        .eq('id', adId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Ad status reset to draft' });
      queryClient.invalidateQueries({ queryKey: ['ad', adId] });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to reset status', description: err.message, variant: 'destructive' });
    }
  });
  
  // Query for ad-specific comments
  const { data: commentsRaw = [] } = useQuery({
    queryKey: ['ad_comments', adId],
    queryFn: async () => {
      if (!adId) return [];
      const { data } = await supabase
        .from('ad_comments')
        .select('*')
        .eq('ad_id', adId)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!adId,
  });
  
  // Separate point comments and general comments
  const pointComments = commentsRaw
    .filter(c => c.comment_type === 'point_comment')
    .map(mapDatabaseToComment);
  
  const generalComments = commentsRaw
    .filter(c => c.comment_type === 'general_comment' || !c.comment_type)
    .map(mapDatabaseToComment);
  
  // Mutation for adding point-specific comments
  const addCommentMutation = useMutation({
    mutationFn: async (comment: { x: number; y: number; text: string }) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId || !adId) {
        throw new Error("User not authenticated or ad ID missing");
      }
      
      const { error } = await supabase
        .from('ad_comments')
        .insert({
          ad_id: adId,
          comment: comment.text,
          user_id: userId,
          x: comment.x,
          y: comment.y,
          comment_type: 'point_comment'
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad_comments', adId] });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to add comment', description: err.message, variant: 'destructive' });
    }
  });
  
  // Mutation for resolving comments
  const resolveCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('ad_comments')
        .update({ 
          is_resolved: true,
          resolved_by: userId,
          resolved_at: new Date().toISOString()
        })
        .eq('id', commentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad_comments', adId] });
      toast({ title: 'Comment resolved' });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to resolve comment', description: err.message, variant: 'destructive' });
    }
  });

  const handleAddComment = (comment: { x: number; y: number; text: string }) => {
    if (!adId) return;
    
    // Prevent adding comments if ad is approved
    if (ad?.approval_status === 'approved') {
      toast({ 
        title: 'Cannot add comments', 
        description: 'Comments cannot be added to approved ads.',
        variant: 'destructive' 
      });
      return;
    }
    
    // Prevent adding comments if campaign status is locked
    const campaignStatus = ad?.adsets?.campaigns?.status;
    if (campaignStatus && ['ready', 'published', 'archived'].includes(campaignStatus)) {
      toast({ 
        title: 'Cannot add comments', 
        description: 'Comments cannot be added when the campaign is ready, published, or archived.',
        variant: 'destructive' 
      });
      return;
    }
    
    addCommentMutation.mutate(comment);
  };
  
  const handleResolveComment = (commentId: string) => {
    resolveCommentMutation.mutate(commentId);
  };

  const handleResetStatus = () => {
    resetStatusMutation.mutate();
  };

  const safeParse = (json: any): any[] => {
    if (!json) return [];
    try {
      if (typeof json === 'string') return JSON.parse(json);
      return Array.isArray(json) ? json : [];
    } catch {
      return [];
    }
  };

  if (isLoading || !ad) return <div className="container mx-auto mt-12 text-center">Loading...</div>;

  const platform = ad.adsets?.campaigns?.platform as Platform || 'Meta';
  const hasMedia = ad.file_url && ad.file_type && ad.file_type !== 'text';
  const isApproved = ad.approval_status === 'approved';
  const campaignStatus = ad.adsets?.campaigns?.status;
  const isCampaignLocked = campaignStatus && ['ready', 'published', 'archived'].includes(campaignStatus);

  return (
    <div className="min-h-screen">
      <AdInformationBanner
        ad={ad}
        onEdit={() => setShowEdit(true)}
        onDelete={() => setShowDelete(true)}
        onReset={handleResetStatus}
      />
      
      <div className="container max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Media and Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Media Section (for platforms that support media) */}
            {hasMedia && (
              <AdMediaSection
                adId={ad.id}
                fileUrl={ad.file_url}
                fileType={ad.file_type}
                comments={pointComments}
                onCommentAdd={handleAddComment}
                onCommentResolve={handleResolveComment}
                canReupload={!isApproved && !isCampaignLocked}
              />
            )}

            {/* Content Preview */}
            <AdContentPreview ad={ad} platform={platform} />

            {/* Text Variations */}
            <Card className="overflow-hidden">
              <div className="p-6 space-y-6">
                <h3 className="text-lg font-semibold">Content Variations</h3>
                <div className="grid gap-6">
                  <AdTextVariations
                    base={ad.headline}
                    variations={safeParse(ad.headline_variations)}
                    label="Headline"
                  />
                  <AdTextVariations
                    base={ad.description}
                    variations={safeParse(ad.description_variations)}
                    label="Description"
                  />
                  <AdTextVariations
                    base={ad.main_text}
                    variations={safeParse(ad.main_text_variations)}
                    label="Main Text"
                  />
                  <AdTextVariations
                    base={ad.keywords}
                    variations={safeParse(ad.keywords_variations)}
                    label="Keywords"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Approval and Comments */}
          <div className="space-y-6">
            {/* Approval Panel */}
            <AdApprovalPanel
              adId={ad.id}
              approvalStatus={ad.approval_status || 'draft'}
              approvedBy={ad.approved_by}
              approvedAt={ad.approved_at}
              rejectionReason={ad.rejection_reason}
              canApprove={!isCampaignLocked}
            />

            {/* General Comments */}
            <AdCommentsPanel
              adId={ad.id}
              comments={generalComments}
              isApproved={isApproved || isCampaignLocked}
            />
          </div>
        </div>

        {/* Edit Dialog */}
        {showEdit && (
          <EditAdDialog
            ad={ad}
            trigger={null}
            open={showEdit}
            onOpenChange={setShowEdit}
          />
        )}

        {/* Delete Dialog */}
        {showDelete && (
          <DeleteAdDialog
            adId={ad.id}
            adName={ad.name}
            trigger={null}
            open={showDelete}
            onOpenChange={setShowDelete}
            onSuccess={() => {
              toast({ title: 'Ad deleted.' });
              queryClient.invalidateQueries({ queryKey: ['ads'] });
              navigate(-1);
            }}
          />
        )}
      </div>
    </div>
  );
}
