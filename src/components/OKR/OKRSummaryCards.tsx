
import { Card, CardContent } from '@/components/ui/card';
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
      <Card className="bg-blue-50 text-blue-700 border-blue-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Active OKRs</p>
              <p className="text-2xl font-bold mt-1">{activeOKRs.length}</p>
              <p className="text-xs opacity-80 mt-1">{okrs.length} total OKRs</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 text-green-700 border-green-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Completion Rate</p>
              <p className="text-2xl font-bold mt-1">{completionRate}%</p>
              <p className="text-xs opacity-80 mt-1">{completedKeyResults} of {totalKeyResults} key results</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-purple-50 text-purple-700 border-purple-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Completed OKRs</p>
              <p className="text-2xl font-bold mt-1">{completedOKRs.length}</p>
              <p className="text-xs opacity-80 mt-1">This period</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-orange-50 text-orange-700 border-orange-200 border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Key Results</p>
              <p className="text-2xl font-bold mt-1">{totalKeyResults}</p>
              <p className="text-xs opacity-80 mt-1">Across all OKRs</p>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
