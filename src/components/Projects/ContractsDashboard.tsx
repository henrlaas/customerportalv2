
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Check, FileX } from "lucide-react";

export const ContractsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    signed: 0,
    unsigned: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchContractStats();
    }
  }, [user]);

  const fetchContractStats = async () => {
    setLoading(true);
    try {
      const { data: totalContracts, error: totalError } = await supabase
        .from('contracts')
        .select('count');
        
      const { data: signedContracts, error: signedError } = await supabase
        .from('contracts')
        .select('count')
        .eq('status', 'signed');
        
      const { data: unsignedContracts, error: unsignedError } = await supabase
        .from('contracts')
        .select('count')
        .eq('status', 'unsigned');
      
      if (totalError || signedError || unsignedError) throw new Error('Error fetching contract stats');
      
      setStats({
        total: totalContracts?.[0]?.count || 0,
        signed: signedContracts?.[0]?.count || 0,
        unsigned: unsignedContracts?.[0]?.count || 0
      });
    } catch (error) {
      console.error('Error fetching contract stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
          <FileText className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? '...' : stats.total}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Signed Contracts</CardTitle>
          <Check className="w-4 h-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? '...' : stats.signed}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Unsigned Contracts</CardTitle>
          <FileX className="w-4 h-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? '...' : stats.unsigned}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
