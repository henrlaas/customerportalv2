
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Target, Plus, Calendar, TrendingUp, Users, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OKRList } from '@/components/OKR/OKRList';
import { OKRDetailsSidebar } from '@/components/OKR/OKRDetailsSidebar';
import { CreateOKRDialog } from '@/components/OKR/CreateOKRDialog';
import { OKRFilters } from '@/components/OKR/OKRFilters';
import { OKRSummaryCards } from '@/components/OKR/OKRSummaryCards';

export type OKR = {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  month: 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';
  year: number;
  owner_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  key_results?: KeyResult[];
  owner?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
};

export type KeyResult = {
  id: string;
  okr_id: string;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  unit: string;
  status: 'not_started' | 'on_track' | 'at_risk' | 'completed';
  created_at: string;
  updated_at: string;
};

export type OKRUpdate = {
  id: string;
  okr_id: string;
  key_result_id: string | null;
  update_text: string;
  progress_percentage: number | null;
  created_by: string;
  created_at: string;
  creator?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
};

const OKRPage = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedOKR, setSelectedOKR] = useState<OKR | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    month: 'all',
    year: new Date().getFullYear(),
    status: 'all',
    owner: 'all',
  });

  // Only admins can access this page
  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Fetch OKRs with key results and owner information
  const { data: okrs = [], isLoading } = useQuery({
    queryKey: ['okrs', filters],
    queryFn: async () => {
      let query = supabase
        .from('okrs')
        .select(`
          *,
          key_results(*),
          owner:profiles!okrs_owner_id_fkey(id, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.month !== 'all') {
        query = query.eq('month', filters.month as 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December');
      }
      
      if (filters.year) {
        query = query.eq('year', filters.year);
      }
      
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status as 'draft' | 'active' | 'completed' | 'cancelled');
      }
      
      if (filters.owner !== 'all') {
        query = query.eq('owner_id', filters.owner);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: 'Error fetching OKRs',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }

      return data as OKR[];
    },
  });

  // Fetch profiles for owner filter
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles-okr'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('role', ['admin', 'employee'])
        .order('first_name');

      if (error) {
        toast({
          title: 'Error fetching profiles',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }

      return data;
    },
  });

  const handleOKRClick = (okr: OKR) => {
    setSelectedOKR(okr);
    setIsSidebarOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['okrs'] });
  };

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' }) as 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6" />
          <h1 className="text-2xl font-bold">OKRs</h1>
        </div>
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create OKR
        </Button>
      </div>

      <p className="text-muted-foreground mb-8">
        Set and track Objectives and Key Results to drive ambitious goals with measurable outcomes.
      </p>

      {/* Summary Cards */}
      <OKRSummaryCards okrs={okrs} />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <OKRFilters
            filters={filters}
            setFilters={setFilters}
            profiles={profiles}
            currentMonth={currentMonth}
          />
        </CardContent>
      </Card>

      {/* OKR List */}
      <OKRList
        okrs={okrs}
        isLoading={isLoading}
        onOKRClick={handleOKRClick}
      />

      {/* OKR Details Sidebar */}
      <OKRDetailsSidebar
        okr={selectedOKR}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onUpdate={() => {
          queryClient.invalidateQueries({ queryKey: ['okrs'] });
          if (selectedOKR) {
            queryClient.invalidateQueries({ queryKey: ['okr', selectedOKR.id] });
          }
        }}
      />

      {/* Create OKR Dialog */}
      <CreateOKRDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
        profiles={profiles}
        currentMonth={currentMonth}
        currentYear={new Date().getFullYear()}
      />
    </div>
  );
};

export default OKRPage;
