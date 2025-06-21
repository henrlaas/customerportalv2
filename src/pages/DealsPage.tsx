import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, DollarSign, Target, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { DealsKanban } from '@/components/Deals/DealsKanban';
import { CreateDealDialog } from '@/components/Deals/CreateDealDialog';
import { DealDetailSheet } from '@/components/Deals/DealDetailSheet';
import { UserSelect } from '@/components/Deals/UserSelect';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminEmployeeProfiles } from '@/hooks/useAdminEmployeeProfiles';
import { useRealtimeDeals } from '@/hooks/realtime/useRealtimeDeals';

const DealsPage = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userInitialized, setUserInitialized] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [isDealSheetOpen, setIsDealSheetOpen] = useState(false);

  console.log('💰 DealsPage: Setting up real-time monitoring for user:', user?.id);

  // Enable real-time updates for deals
  useRealtimeDeals({ enabled: !!user?.id });

  // Fetch admin and employee profiles for user selector
  const { data: adminEmployeeProfiles = [] } = useAdminEmployeeProfiles();
  
  // Initialize selected user to current user (if they are admin/employee)
  React.useEffect(() => {
    if (!userInitialized && user?.id && profile?.role && ['admin', 'employee'].includes(profile.role)) {
      setSelectedUserId(user.id);
      setUserInitialized(true);
    }
  }, [user?.id, profile?.role, userInitialized]);

  const dealStages = [
    'Prospect',
    'Qualified',
    'Proposal',
    'Negotiation',
    'Closed Won',
    'Closed Lost',
  ];

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedUserId) {
        query = query.eq('user_id', selectedUserId);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: 'Error fetching deals',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }

      return data;
    },
  });

  const filteredDeals = React.useMemo(() => {
    if (!deals) return [];

    const searchString = searchQuery.toLowerCase();

    return deals.filter((deal) => {
      const matchesSearch =
        deal.name.toLowerCase().includes(searchString) ||
        deal.company_name.toLowerCase().includes(searchString);
      return matchesSearch;
    });
  }, [deals, searchQuery]);

  const handleCreateDialogClose = () => {
    setIsCreateDialogOpen(false);
    // Real-time updates will handle list refresh
  };

  const handleDealClick = (dealId: string) => {
    setSelectedDealId(dealId);
    setIsDealSheetOpen(true);
  };

  // Skeleton loader for Kanban board
  const KanbanBoardSkeleton = () => (
    <div className="flex gap-4 overflow-x-auto">
      {dealStages.map((stage) => (
        <Card key={stage} className="w-80 flex-shrink-0">
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-24" /></CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Array(3).fill(null).map((_, i) => (
              <Card key={i} className="p-4">
                <CardContent>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Deals</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your sales pipeline
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Deal
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search deals..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <UserSelect
          profiles={adminEmployeeProfiles}
          selectedUserId={selectedUserId}
          onUserChange={setSelectedUserId}
          allUsersLabel="All deals"
        />
      </div>

      {isLoading ? (
        <KanbanBoardSkeleton />
      ) : (
        <DealsKanban deals={filteredDeals} onDealClick={handleDealClick} />
      )}

      <CreateDealDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCreateDialogClose}
      />

      <DealDetailSheet
        isOpen={isDealSheetOpen}
        onOpenChange={setIsDealSheetOpen}
        dealId={selectedDealId}
      />
    </div>
  );
};

export default DealsPage;
