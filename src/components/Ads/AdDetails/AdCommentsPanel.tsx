import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckCircle, Clock, Reply, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface CommentsPanelProps {
  adId: string;
  comments: any[];
  isApproved?: boolean;
}

export function AdCommentsPanel({ adId, comments, isApproved = false }: CommentsPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  // Check if user can delete comments (admin or employee)
  const canDeleteComments = profile?.role === 'admin' || profile?.role === 'employee';

  // Fetch user profiles for comments
  const userIds = comments.map(c => c.user_id).filter(Boolean);
  const { data: userProfiles = [] } = useQuery({
    queryKey: ['user_profiles', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return [];
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, avatar_url')
        .in('id', userIds);
      return data || [];
    },
    enabled: userIds.length > 0,
  });

  const getUserProfile = (userId: string) => {
    const profile = userProfiles.find(p => p.id === userId);
    return {
      firstName: profile?.first_name || 'Unknown User',
      avatarUrl: profile?.avatar_url,
      initials: profile?.first_name ? profile.first_name.charAt(0).toUpperCase() : 'U'
    };
  };

  const addCommentMutation = useMutation({
    mutationFn: async ({ text, parentId }: { text: string; parentId?: string }) => {
      if (isApproved) {
        throw new Error("Cannot add comments to approved ads");
      }
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('ad_comments')
        .insert({
          ad_id: adId,
          comment: text,
          user_id: userId,
          comment_type: 'general_comment',
          parent_comment_id: parentId || null
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Comment added successfully' });
      queryClient.invalidateQueries({ queryKey: ['ad_comments', adId] });
      setNewComment('');
      setReplyingTo(null);
      setReplyText('');
    },
    onError: (error: any) => {
      toast({ title: 'Failed to add comment', description: error.message, variant: 'destructive' });
    }
  });

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
      toast({ title: 'Comment resolved' });
      queryClient.invalidateQueries({ queryKey: ['ad_comments', adId] });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to resolve comment', description: error.message, variant: 'destructive' });
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('ad_comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Comment deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['ad_comments', adId] });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to delete comment', description: error.message, variant: 'destructive' });
    }
  });

  // Group comments by parent/child relationship
  const parentComments = comments.filter(c => !c.parent_comment_id);
  const childComments = comments.filter(c => c.parent_comment_id);

  const getChildComments = (parentId: string) => {
    return childComments.filter(c => c.parent_comment_id === parentId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          General Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new comment - only show if not approved */}
        {!isApproved && (
          <div className="space-y-2">
            <Textarea
              placeholder="Add a general comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <Button
              onClick={() => addCommentMutation.mutate({ text: newComment })}
              disabled={!newComment.trim() || addCommentMutation.isPending}
              size="sm"
            >
              Add Comment
            </Button>
          </div>
        )}

        {/* Show message if approved */}
        {isApproved && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              This ad is approved. Comments cannot be added or modified.
            </p>
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-4">
          {parentComments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No comments yet. {!isApproved && 'Be the first to add one!'}
            </p>
          ) : (
            parentComments.map((comment) => {
              const replies = getChildComments(comment.id);
              const userProfile = getUserProfile(comment.user_id);
              return (
                <div key={comment.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={userProfile.avatarUrl || undefined} />
                          <AvatarFallback className="text-xs">{userProfile.initials}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {userProfile.firstName}
                        </span>
                        {comment.is_resolved && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{comment.comment || comment.text || 'No comment text'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!isApproved && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          disabled={comment.is_resolved}
                        >
                          <Reply className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 ${comment.is_resolved ? 'cursor-default' : ''}`}
                        onClick={() => !comment.is_resolved && resolveCommentMutation.mutate(comment.id)}
                        disabled={resolveCommentMutation.isPending || comment.is_resolved}
                      >
                        <CheckCircle className={`h-4 w-4 ${comment.is_resolved ? 'text-green-600 fill-green-100' : 'hover:text-green-600'}`} />
                      </Button>
                      {canDeleteComments && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:text-red-600"
                          onClick={() => deleteCommentMutation.mutate(comment.id)}
                          disabled={deleteCommentMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Replies */}
                  {replies.length > 0 && (
                    <div className="ml-6 space-y-2 border-l-2 border-muted pl-4">
                      {replies.map((reply) => {
                        const replyUserProfile = getUserProfile(reply.user_id);
                        return (
                          <div key={reply.id} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage src={replyUserProfile.avatarUrl || undefined} />
                                  <AvatarFallback className="text-xs">{replyUserProfile.initials}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm">
                                  {replyUserProfile.firstName}
                                </span>
                              </div>
                              {canDeleteComments && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:text-red-600"
                                  onClick={() => deleteCommentMutation.mutate(reply.id)}
                                  disabled={deleteCommentMutation.isPending}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <p className="text-sm">{reply.comment || reply.text || 'No reply text'}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Reply form - only show if not approved */}
                  {replyingTo === comment.id && !comment.is_resolved && !isApproved && (
                    <div className="ml-6 space-y-2">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => addCommentMutation.mutate({ text: replyText, parentId: comment.id })}
                          disabled={!replyText.trim() || addCommentMutation.isPending}
                        >
                          Reply
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
