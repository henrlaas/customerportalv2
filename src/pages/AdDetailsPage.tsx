
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MessageSquare, History, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { AdMediaViewer } from '@/components/Ads/AdDetails/AdMediaViewer';
import { AdTextVariations } from '@/components/Ads/AdDetails/AdTextVariations';

function AdInformationBanner({ ad, onEdit, onDelete }: { ad: any; onEdit: () => void; onDelete: () => void }) {
  const navigate = useNavigate();

  const handleBackClick = () => {
    // Navigate back to the campaign details page where this ad's adset belongs
    if (ad.adsets?.campaign_id) {
      navigate(`/campaigns/${ad.adsets.campaign_id}`);
    } else {
      // Fallback to campaigns list if we don't have campaign_id
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
                <Badge variant="secondary">{ad.file_type || ad.ad_type}</Badge>
                {ad.adsets?.name && (
                  <>
                    <span>•</span>
                    <span>{ad.adsets.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
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

function CommentList({ adId }: { adId: string }) {
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['ad_comments', adId],
    queryFn: async () => {
      const { data } = await supabase
        .from('ad_comments')
        .select('id, comment, created_at, user_id')
        .eq('ad_id', adId)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  return (
    <div>
      <div className="font-semibold flex items-center gap-2 mt-6 mb-2">
        <MessageSquare className="w-4 h-4" /> Comments
      </div>
      {isLoading ? <div className="text-muted-foreground">Loading...</div> :
        comments.length === 0 ? <div className="text-sm text-muted-foreground">No comments yet.</div>
        : (
          <ul className="space-y-2">
            {comments.map((c: any) => (
              <li key={c.id} className="border rounded px-3 py-2">
                <span className="font-medium">{c.user_id.slice(0, 8)}:</span> {c.comment}
                <div className="text-xs text-muted-foreground mt-1">{new Date(c.created_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )
      }
    </div>
  );
}

function HistoryLog({ adId }: { adId: string }) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['ad_history', adId],
    queryFn: async () => {
      const { data } = await supabase
        .from('ad_history')
        .select('id, created_at, action_type, details, user_id')
        .eq('ad_id', adId)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  return (
    <div>
      <div className="font-semibold flex items-center gap-2 mt-6 mb-2">
        <History className="w-4 h-4" /> History Log
      </div>
      {isLoading ? <div className="text-muted-foreground">Loading...</div> :
        events.length === 0 ? <div className="text-sm text-muted-foreground">No history items yet.</div>
        : (
          <ul className="space-y-2">
            {events.map((e: any) => (
              <li key={e.id} className="border rounded px-3 py-2">
                <div>
                  <span className="font-semibold">{e.action_type}</span> by {e.user_id ? e.user_id.slice(0,8) : 'system'}
                </div>
                <div className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</div>
                {e.details && <pre className="text-xs mt-1">{JSON.stringify(e.details, null, 2)}</pre>}
              </li>
            ))}
          </ul>
        )
      }
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
}

// Helper to convert database comment to frontend Comment format
const mapDatabaseToComment = (comment: CommentData): any => {
  // Map database fields to our Comment interface expected by AdMediaViewer
  return {
    id: comment.id,
    x: comment.x || 50, // Default to center if not specified
    y: comment.y || 50, // Default to center if not specified
    text: comment.comment,
    isResolved: comment.is_resolved || false
  };
};

export default function AdDetailsPage() {
  const { adId } = useParams<{ adId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { data: ad, isLoading, refetch } = useQuery({
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
            campaign_id
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
  
  // Query for ad-specific comments
  const { data: pointCommentsRaw = [], refetch: refetchComments } = useQuery({
    queryKey: ['ad_point_comments', adId],
    queryFn: async () => {
      if (!adId) return [];
      const { data } = await supabase
        .from('ad_comments')
        .select('*')
        .eq('ad_id', adId);
      return data || [];
    },
    enabled: !!adId,
  });
  
  // Map database comments to our frontend Comment format
  const pointComments = pointCommentsRaw.map(mapDatabaseToComment);
  
  // Mutation for adding point-specific comments
  const addCommentMutation = useMutation({
    mutationFn: async (comment: { x: number; y: number; text: string }) => {
      // Get user ID from authentication
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId || !adId) {
        throw new Error("User not authenticated or ad ID missing");
      }
      
      const { error, data } = await supabase
        .from('ad_comments')
        .insert({
          ad_id: adId,
          comment: comment.text,
          user_id: userId,
          x: comment.x,
          y: comment.y
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad_point_comments', adId] });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to add comment', description: err.message, variant: 'destructive' });
    }
  });
  
  // Mutation for resolving comments
  const resolveCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('ad_comments')
        .update({ is_resolved: true })
        .eq('id', commentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad_point_comments', adId] });
      toast({ title: 'Comment resolved' });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to resolve comment', description: err.message, variant: 'destructive' });
    }
  });

  const handleAddComment = (comment: { x: number; y: number; text: string }) => {
    if (!adId) return;
    addCommentMutation.mutate(comment);
  };
  
  const handleResolveComment = (commentId: string) => {
    resolveCommentMutation.mutate(commentId);
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

  return (
    <div className="min-h-screen">
      <AdInformationBanner
        ad={ad}
        onEdit={() => setShowEdit(true)}
        onDelete={() => setShowDelete(true)}
      />
      
      <div className="container max-w-6xl mx-auto py-8">
        <Card>
          <div className="px-6 pb-6 space-y-6">
            {/* Media Viewer with Comments */}
            {(ad.ad_type === 'image' || ad.ad_type === 'video') && ad.file_url && (
              <AdMediaViewer
                fileUrl={ad.file_url}
                fileType={ad.ad_type}
                adId={ad.id}
                comments={pointComments}
                onCommentAdd={handleAddComment}
                onCommentResolve={handleResolveComment}
              />
            )}

            {/* Text Variations */}
            <div className="grid gap-6 mt-6">
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

            {/* URL and CTA */}
            {(ad.url || ad.cta_button) && (
              <Card className="overflow-hidden">
                <div className="p-6">
                  {ad.url && (
                    <div className="mb-4">
                      <div className="font-semibold mb-2">URL</div>
                      <a
                        href={ad.url}
                        className="text-blue-600 hover:text-blue-800 break-all"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {ad.url}
                      </a>
                    </div>
                  )}
                  {ad.cta_button && (
                    <div>
                      <div className="font-semibold mb-2">CTA Button</div>
                      <Badge>{ad.cta_button}</Badge>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Comments and History */}
            <div className="space-y-6">
              <CommentList adId={ad.id} />
              <HistoryLog adId={ad.id} />
            </div>
          </div>
        </Card>

        {/* Edit Dialog */}
        {showEdit && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-lg p-8 relative w-[95vw] max-w-lg shadow">
              <button onClick={() => setShowEdit(false)} className="absolute top-3 right-3 text-lg text-gray-500">&times;</button>
              <div className="text-center">Edit Ad dialog goes here.</div>
            </div>
          </div>
        )}

        {/* Delete Dialog */}
        {showDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-lg p-8 relative w-[95vw] max-w-sm shadow">
              <div className="mb-3 font-medium text-center">Are you sure you want to delete this ad?</div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => deleteMutation.mutate()}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
