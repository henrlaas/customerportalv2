
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MessageSquare, History, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

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

function VariationsSection({ base, variations, label }: { base: string | null, variations: any[], label: string }) {
  return (
    <div className="mb-4">
      <div className="font-semibold mb-1">{label}:</div>
      {base && (
        <div className="rounded bg-card text-sm px-3 py-2 border mb-1">
          <span className="font-medium">Base:</span> {base}
        </div>
      )}
      {variations?.length > 0 && variations.map((v: any, idx: number) =>
        <div key={idx} className="rounded bg-muted text-sm px-3 py-2 mb-1 ml-4">
          <span className="font-medium">Variation {idx + 1}:</span> {v.text}
        </div>
      )}
    </div>
  );
}

function CommentForm({ adId, onComment }: { adId: string, onComment: () => void }) {
  const [comment, setComment] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) throw new Error("You must be signed in to comment.");
      const { error } = await supabase
        .from('ad_comments')
        .insert({ ad_id: adId, user_id: userId, comment });
      if (error) throw error;
    },
    onSuccess: () => {
      setComment('');
      toast({ title: 'Comment Added' });
      queryClient.invalidateQueries({ queryKey: ['ad_comments', adId] });
      onComment();
    },
    onError: () => {
      toast({ title: 'Error', description: 'Could not add comment', variant: 'destructive' });
    }
  });

  return (
    <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }} className="flex gap-2 mt-3">
      <input
        value={comment}
        onChange={e => setComment(e.target.value)}
        className="flex-grow border px-3 py-2 rounded text-sm"
        placeholder="Leave a comment for feedback..."
        required
      />
      <Button type="submit" disabled={mutation.isPending || !comment.trim()}>Comment</Button>
    </form>
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

  // Fetch ad
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

  // Edit (shows dialog)
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Delete action
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

  if (isLoading || !ad) return <div className="container mx-auto mt-12 text-center">Loading...</div>;

  // Parse variations (ensure fallback to empty arrays)
  const safeParse = (json: any): any[] => {
    if (!json) return [];
    try {
      if (typeof json === 'string') return JSON.parse(json);
      return Array.isArray(json) ? json : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <Card>
        <AdInformationBanner
          ad={ad}
          onEdit={() => setShowEdit(true)}
          onDelete={() => setShowDelete(true)}
        />
        <div className="flex flex-col gap-4 px-6 pb-6">
          {/* Ad Media */}
          <div>
            {ad.ad_type === 'image' && ad.file_url && (
              <img src={ad.file_url} className="w-full rounded-lg border max-h-96 object-contain bg-muted" alt={ad.name} />
            )}
            {ad.ad_type === 'video' && ad.file_url && (
              <video src={ad.file_url} controls className="w-full rounded-lg border bg-muted max-h-96" />
            )}
          </div>

          {/* Text variations */}
          <VariationsSection
            base={ad.headline}
            variations={safeParse(ad.headline_variations)}
            label="Headline"
          />
          <VariationsSection
            base={ad.description}
            variations={safeParse(ad.description_variations)}
            label="Description"
          />
          <VariationsSection
            base={ad.main_text}
            variations={safeParse(ad.main_text_variations)}
            label="Main Text"
          />
          <VariationsSection
            base={ad.keywords}
            variations={safeParse(ad.keywords_variations)}
            label="Keywords"
          />

          {/* Other fields */}
          {ad.cta_button && (
            <div>
              <span className="font-semibold">CTA:</span>{' '}
              <Badge className="px-3">{ad.cta_button}</Badge>
            </div>
          )}
          {ad.url && (
            <div>
              <span className="font-semibold">URL:</span>{' '}
              <a
                href={ad.url}
                className="underline text-blue-700 hover:text-blue-900"
                rel="noopener noreferrer"
                target="_blank"
              >
                {ad.url}
              </a>
            </div>
          )}

          {/* Comments */}
          <CommentForm adId={ad.id} onComment={refetch} />
          <CommentList adId={ad.id} />

          {/* History log */}
          <HistoryLog adId={ad.id} />
        </div>
      </Card>
      {/* Edit/Delete dialogs loaded here */}
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
  );
}
