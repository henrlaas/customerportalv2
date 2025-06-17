import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, Plus, Target, TrendingUp, Calendar, User } from 'lucide-react';
import { OKR, KeyResult, OKRUpdate } from '@/pages/OKRPage';
import { CreateKeyResultDialog } from './CreateKeyResultDialog';
import { EditOKRDialog } from './EditOKRDialog';
import { DeleteOKRDialog } from './DeleteOKRDialog';
import { EditKeyResultDialog } from './EditKeyResultDialog';
import { DeleteKeyResultDialog } from './DeleteKeyResultDialog';

interface OKRDetailsSidebarProps {
  okr: OKR | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const OKRDetailsSidebar: React.FC<OKRDetailsSidebarProps> = ({
  okr,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreateKeyResultOpen, setIsCreateKeyResultOpen] = useState(false);
  const [isEditOKROpen, setIsEditOKROpen] = useState(false);
  const [isDeleteOKROpen, setIsDeleteOKROpen] = useState(false);
  const [selectedKeyResult, setSelectedKeyResult] = useState<KeyResult | null>(null);
  const [isEditKeyResultOpen, setIsEditKeyResultOpen] = useState(false);
  const [isDeleteKeyResultOpen, setIsDeleteKeyResultOpen] = useState(false);

  // Fetch OKR updates
  const { data: updates = [] } = useQuery({
    queryKey: ['okr-updates', okr?.id],
    queryFn: async () => {
      if (!okr?.id) return [];

      const { data, error } = await supabase
        .from('okr_updates')
        .select(`
          *,
          creator:profiles!okr_updates_created_by_fkey(id, first_name, last_name)
        `)
        .eq('okr_id', okr.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OKRUpdate[];
    },
    enabled: !!okr?.id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getKeyResultStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-500';
      case 'on_track': return 'bg-green-500';
      case 'at_risk': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const handleEditKeyResult = (keyResult: KeyResult) => {
    setSelectedKeyResult(keyResult);
    setIsEditKeyResultOpen(true);
  };

  const handleDeleteKeyResult = (keyResult: KeyResult) => {
    setSelectedKeyResult(keyResult);
    setIsDeleteKeyResultOpen(true);
  };

  const handleOKRDeleted = () => {
    onClose(); // Close the sidebar when OKR is deleted
    onUpdate(); // Refresh the OKR list
  };

  if (!okr) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[600px] sm:w-[600px] overflow-y-auto">
          <SheetHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-xl font-bold break-words">{okr.title}</SheetTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`${getStatusColor(okr.status)} text-white`}>
                    {okr.status.charAt(0).toUpperCase() + okr.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {okr.month} {okr.year}
                  </Badge>
                </div>
              </div>
              {isAdmin && (
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditOKROpen(true)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDeleteOKROpen(true)}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* OKR Details */}
            <div className="space-y-4">
              {okr.description && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-2">Description</h3>
                  <p className="text-sm">{okr.description}</p>
                </div>
              )}

              {okr.owner && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Owner: {okr.owner.first_name} {okr.owner.last_name}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Key Results Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Key Results ({okr.key_results?.length || 0})
                </h3>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateKeyResultOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Key Result
                  </Button>
                )}
              </div>

              {okr.key_results && okr.key_results.length > 0 ? (
                <div className="space-y-3">
                  {okr.key_results.map((keyResult) => {
                    const progress = calculateProgress(keyResult.current_value, keyResult.target_value);
                    return (
                      <Card key={keyResult.id} className="relative">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm font-medium break-words">
                                {keyResult.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  className={`${getKeyResultStatusColor(keyResult.status)} text-white text-xs`}
                                >
                                  {keyResult.status.replace('_', ' ').charAt(0).toUpperCase() + 
                                   keyResult.status.replace('_', ' ').slice(1)}
                                </Badge>
                              </div>
                            </div>
                            {isAdmin && (
                              <div className="flex items-center gap-1 ml-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditKeyResult(keyResult)}
                                  className="h-6 w-6"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteKeyResult(keyResult)}
                                  className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {keyResult.description && (
                            <p className="text-xs text-muted-foreground mb-2">{keyResult.description}</p>
                          )}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span>Progress</span>
                              <span className="font-medium">
                                {keyResult.current_value} / {keyResult.target_value} {keyResult.unit}
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <div className="text-right text-xs text-muted-foreground">
                              {progress.toFixed(1)}%
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No key results yet</p>
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreateKeyResultOpen(true)}
                      className="mt-2"
                    >
                      Add First Key Result
                    </Button>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Updates Section */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Recent Updates ({updates.length})
              </h3>

              {updates.length > 0 ? (
                <div className="space-y-3">
                  {updates.slice(0, 5).map((update) => (
                    <div key={update.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-xs text-muted-foreground">
                          {update.creator?.first_name} {update.creator?.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(update.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-sm">{update.update_text}</p>
                      {update.progress_percentage !== null && (
                        <div className="mt-2">
                          <div className="text-xs text-muted-foreground mb-1">Progress Update</div>
                          <Progress value={update.progress_percentage} className="h-1" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No updates yet</p>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      <CreateKeyResultDialog
        okrId={okr.id}
        isOpen={isCreateKeyResultOpen}
        onClose={() => setIsCreateKeyResultOpen(false)}
        onSuccess={onUpdate}
      />

      <EditOKRDialog
        okr={okr}
        isOpen={isEditOKROpen}
        onClose={() => setIsEditOKROpen(false)}
        onSuccess={onUpdate}
      />

      <DeleteOKRDialog
        okr={okr}
        isOpen={isDeleteOKROpen}
        onClose={() => setIsDeleteOKROpen(false)}
        onSuccess={handleOKRDeleted}
      />

      <EditKeyResultDialog
        keyResult={selectedKeyResult}
        isOpen={isEditKeyResultOpen}
        onClose={() => {
          setIsEditKeyResultOpen(false);
          setSelectedKeyResult(null);
        }}
        onSuccess={onUpdate}
      />

      <DeleteKeyResultDialog
        keyResult={selectedKeyResult}
        isOpen={isDeleteKeyResultOpen}
        onClose={() => {
          setIsDeleteKeyResultOpen(false);
          setSelectedKeyResult(null);
        }}
        onSuccess={onUpdate}
      />
    </>
  );
};
