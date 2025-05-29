
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ApprovalPanelProps {
  adId: string;
  approvalStatus: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  canApprove?: boolean;
}

export function AdApprovalPanel({ 
  adId, 
  approvalStatus, 
  approvedBy, 
  approvedAt, 
  rejectionReason,
  canApprove = false 
}: ApprovalPanelProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async (action: 'approve' | 'reject') => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId) throw new Error("User not authenticated");
      
      const updates: any = {
        approval_status: action === 'approve' ? 'approved' : 'rejected',
        approved_by: userId,
        approved_at: new Date().toISOString(),
      };
      
      if (action === 'reject' && rejectReason) {
        updates.rejection_reason = rejectReason;
      }
      
      const { error } = await supabase
        .from('ads')
        .update(updates)
        .eq('id', adId);
      
      if (error) throw error;
    },
    onSuccess: (_, action) => {
      toast({ 
        title: `Ad ${action === 'approve' ? 'approved' : 'rejected'}`,
        description: `The ad has been ${action === 'approve' ? 'approved' : 'rejected'} successfully.`
      });
      queryClient.invalidateQueries({ queryKey: ['ad', adId] });
      setShowRejectForm(false);
      setRejectReason('');
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const getStatusIcon = () => {
    switch (approvalStatus) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending_approval':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (approvalStatus) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if the ad is in a final state (approved or rejected)
  const isInFinalState = approvalStatus === 'approved' || approvalStatus === 'rejected';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Approval Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor()}>
            {approvalStatus.replace('_', ' ').toUpperCase()}
          </Badge>
          {approvedAt && (
            <span className="text-sm text-muted-foreground">
              {new Date(approvedAt).toLocaleString()}
            </span>
          )}
        </div>

        {rejectionReason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              <strong>Rejection Reason:</strong> {rejectionReason}
            </p>
          </div>
        )}

        {/* Only show approval/rejection buttons if the ad is not in a final state AND campaign allows it */}
        {canApprove && !isInFinalState && (
          <div className="space-y-2">
            {!showRejectForm ? (
              <div className="flex gap-2">
                <Button 
                  onClick={() => approveMutation.mutate('approve')}
                  disabled={approveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Approve Ad
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowRejectForm(true)}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Reject Ad
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  placeholder="Please provide a reason for rejection..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-h-[80px]"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={() => approveMutation.mutate('reject')}
                    disabled={approveMutation.isPending || !rejectReason.trim()}
                    variant="destructive"
                  >
                    Confirm Rejection
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectReason('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Show appropriate message based on state */}
        {isInFinalState && (
          <div className="text-sm text-muted-foreground">
            This ad has been {approvalStatus} and cannot be modified further.
          </div>
        )}
        
        {!canApprove && !isInFinalState && (
          <div className="text-sm text-muted-foreground">
            Approval status cannot be changed when the campaign is ready, published, or archived.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
