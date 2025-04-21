import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MessageSquare, History } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { AdMediaViewer } from '@/components/Ads/AdDetails/AdMediaViewer';
import { AdTextVariations } from '@/components/Ads/AdDetails/AdTextVariations';
import { AppLayout } from '@/components/Layout/AppLayout';

function AdInformationBanner({ ad, onEdit, onDelete }: { ad: any; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-muted/50 border-b px-6 py-4 mb-6 rounded-t-lg">
      <div>
        <h1 className="text-2xl font-semibold">{ad.name}</h1>
        <Badge className="mt-2">{ad.file_type || ad.ad_type}</Badge>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button onClick={onEdit} variant="outline" size="sm"><Edit className="w-4 h-4 mr-1.5" /> Edit</Button>
        <Button onClick={onDelete} variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-1.5" /> Delete</Button>
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
        .select('*')
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
    <AppLayout>
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <AdInformationBanner
            ad={ad}
            onEdit={() => setShowEdit(true)}
            onDelete={() => setShowDelete(true)}
          />
          
          <div className="px-6 pb-6 space-y-6">
            {/* Media Viewer with Comments */}
            {(ad.ad_type === 'image' || ad.ad_type === 'video') && ad.file_url && (
              <AdMediaViewer
                fileUrl={ad.file_url}
                fileType={ad.ad_type}
                adId={ad.id}
                comments={[]} // TODO: Implement point-specific comments
                onCommentAdd={() => {}} // TODO: Implement point-specific comment adding
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

        {showEdit && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-lg p-8 relative w-[95vw] max-w-lg shadow">
              <button onClick={() => setShowEdit(false)} className="absolute top-3 right-3 text-lg text-gray-500">&times;</button>
              {/* Reuse EditAdDialog component when available */}
              {/* <EditAdDialog ad={ad} onSuccess={() => { setShowEdit(false); refetch(); }} /> */}
              <div className="text-center">Edit Ad dialog goes here.</div>
            </div>
          </div>
        )}
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
    </AppLayout>
  );
}
