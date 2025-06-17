
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Plus, Edit, Trash2, MessageSquare, TrendingUp, User, Calendar } from 'lucide-react';
import { OKR, KeyResult, OKRUpdate } from '@/pages/OKRPage';
import { EditOKRDialog } from './EditOKRDialog';
import { CreateKeyResultDialog } from './CreateKeyResultDialog';

interface OKRDetailsSidebarProps {
  okr: OKR | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function OKRDetailsSidebar({ okr, isOpen, onClose, onUpdate }: OKRDetailsSidebarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateKeyResultOpen, setIsCreateKeyResultOpen] = useState(false);
  const [updateText, setUpdateText] = useState('');

  // Fetch detailed OKR data with updates
  const { data: detailedOKR, isLoading } = useQuery({
    queryKey: ['okr', okr?.id],
    queryFn: async () => {
      if (!okr?.id) return null;
      
      const { data, error } = await supabase
        .from('okrs')
        .select(`
          *,
          key_results(*),
          owner:profiles!okrs_owner_id_fkey(id, first_name, last_name)
        `)
        .eq('id', okr.id)
        .single();

      if (error) throw error;
      return data as OKR;
    },
    enabled: !!okr?.id,
  });

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

  // Add update mutation
  const addUpdateMutation = useMutation({
    mutationFn: async ({ text }: { text: string }) => {
      if (!okr?.id) throw new Error('No OKR selected');
      
      const { error } = await supabase
        .from('okr_updates')
        .insert({
          okr_id: okr.id,
          update_text: text,
          created_by: (await supabase.auth.getUser()).data.user?.id!,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setUpdateText('');
      queryClient.invalidateQueries({ queryKey: ['okr-updates', okr?.id] });
      toast({
        title: 'Update added',
        description: 'Progress update has been added successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error adding update',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const calculateProgress = (keyResults: KeyResult[] = []) => {
    if (keyResults.length === 0) return 0;
    
    const totalProgress = keyResults.reduce((sum, kr) => {
      return sum + Math.min((kr.current_value / kr.target_value) * 100, 100);
    }, 0);
    
    return Math.round(totalProgress / keyResults.length);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>;
    }
  };

  const getKeyResultStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'on_track':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">On Track</Badge>;
      case 'at_risk':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">At Risk</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Not Started</Badge>;
    }
  };

  const handleAddUpdate = () => {
    if (!updateText.trim()) return;
    addUpdateMutation.mutate({ text: updateText });
  };

  if (!okr) return null;

  const currentOKR = detailedOKR || okr;
  const progress = calculateProgress(currentOKR.key_results);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[600px] max-w-[90vw] overflow-y-auto">
          <SheetHeader className="mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="text-xl mb-2">{currentOKR.title}</SheetTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {currentOKR.quarter} {currentOKR.year}
                  </div>
                  {currentOKR.owner && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {currentOKR.owner.first_name || currentOKR.owner.last_name
                        ? `${currentOKR.owner.first_name || ''} ${currentOKR.owner.last_name || ''}`.trim()
                        : 'Unassigned'}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(currentOKR.status)}
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">{progress}% Complete</span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </SheetHeader>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="key-results">Key Results</TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-lg font-bold">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Key Results</p>
                        <p className="font-medium">{currentOKR.key_results?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p className="font-medium">
                          {currentOKR.key_results?.filter(kr => kr.status === 'completed').length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {currentOKR.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{currentOKR.description}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="key-results" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Key Results</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateKeyResultOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Key Result
                </Button>
              </div>

              {currentOKR.key_results?.map((keyResult) => {
                const krProgress = Math.min((keyResult.current_value / keyResult.target_value) * 100, 100);
                
                return (
                  <Card key={keyResult.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium">{keyResult.title}</h4>
                          {getKeyResultStatusBadge(keyResult.status)}
                        </div>
                        
                        {keyResult.description && (
                          <p className="text-sm text-muted-foreground">{keyResult.description}</p>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span className="font-medium">
                              {keyResult.current_value} / {keyResult.target_value} {keyResult.unit}
                            </span>
                          </div>
                          <Progress value={krProgress} className="h-2" />
                          <p className="text-xs text-muted-foreground">{Math.round(krProgress)}% complete</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {(!currentOKR.key_results || currentOKR.key_results.length === 0) && (
                <div className="text-center p-8 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2" />
                  <p>No key results yet</p>
                  <p className="text-sm">Add key results to track progress</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="updates" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="update">Add Progress Update</Label>
                  <div className="mt-2 space-y-2">
                    <Textarea
                      id="update"
                      placeholder="Share progress, challenges, or achievements..."
                      value={updateText}
                      onChange={(e) => setUpdateText(e.target.value)}
                    />
                    <Button
                      onClick={handleAddUpdate}
                      disabled={!updateText.trim() || addUpdateMutation.isPending}
                      size="sm"
                    >
                      Add Update
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {updates.map((update) => (
                    <Card key={update.id}>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {update.creator?.first_name || update.creator?.last_name
                                ? `${update.creator.first_name || ''} ${update.creator.last_name || ''}`.trim()
                                : 'Unknown User'}
                            </span>
                            <span>{new Date(update.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm">{update.update_text}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {updates.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                      <p>No updates yet</p>
                      <p className="text-sm">Add the first progress update</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <EditOKRDialog
        okr={currentOKR}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={() => {
          setIsEditDialogOpen(false);
          onUpdate();
        }}
      />

      <CreateKeyResultDialog
        okrId={currentOKR.id}
        isOpen={isCreateKeyResultOpen}
        onClose={() => setIsCreateKeyResultOpen(false)}
        onSuccess={() => {
          setIsCreateKeyResultOpen(false);
          queryClient.invalidateQueries({ queryKey: ['okr', currentOKR.id] });
          onUpdate();
        }}
      />
    </>
  );
}
