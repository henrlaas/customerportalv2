
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Users, Calendar } from 'lucide-react';
import { OKR } from '@/pages/OKRPage';

interface OKRSummaryCardsProps {
  okrs: OKR[];
}

export function OKRSummaryCards({ okrs }: OKRSummaryCardsProps) {
  const activeOKRs = okrs.filter(okr => okr.status === 'active');
  const completedOKRs = okrs.filter(okr => okr.status === 'completed');
  const totalKeyResults = okrs.reduce((sum, okr) => sum + (okr.key_results?.length || 0), 0);
  const completedKeyResults = okrs.reduce(
    (sum, okr) => sum + (okr.key_results?.filter(kr => kr.status === 'completed').length || 0),
    0
  );
  
  const completionRate = totalKeyResults > 0 ? Math.round((completedKeyResults / totalKeyResults) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active OKRs</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeOKRs.length}</div>
          <p className="text-xs text-muted-foreground">
            {okrs.length} total OKRs
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate}%</div>
          <p className="text-xs text-muted-foreground">
            {completedKeyResults} of {totalKeyResults} key results
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed OKRs</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedOKRs.length}</div>
          <p className="text-xs text-muted-foreground">
            This period
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Key Results</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalKeyResults}</div>
          <p className="text-xs text-muted-foreground">
            Across all OKRs
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
