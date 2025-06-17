
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, User, Calendar } from 'lucide-react';
import { OKR } from '@/pages/OKRPage';

interface OKRListProps {
  okrs: OKR[];
  isLoading: boolean;
  onOKRClick: (okr: OKR) => void;
}

export function OKRList({ okrs, isLoading, onOKRClick }: OKRListProps) {
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

  const calculateProgress = (keyResults: any[] = []) => {
    if (keyResults.length === 0) return 0;
    
    const totalProgress = keyResults.reduce((sum, kr) => {
      return sum + Math.min((kr.current_value / kr.target_value) * 100, 100);
    }, 0);
    
    return Math.round(totalProgress / keyResults.length);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (okrs.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/10 rounded-lg">
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-600 mb-2">No OKRs found</p>
        <p className="text-gray-500">Create your first OKR to get started with goal tracking</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {okrs.map((okr) => {
        const progress = calculateProgress(okr.key_results);
        
        return (
          <Card
            key={okr.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onOKRClick(okr)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{okr.title}</CardTitle>
                {getStatusBadge(okr.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {okr.month} {okr.year}
                </div>
                {okr.owner && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {okr.owner.first_name || okr.owner.last_name
                      ? `${okr.owner.first_name || ''} ${okr.owner.last_name || ''}`.trim()
                      : 'Unassigned'}
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {okr.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {okr.description}
                </p>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {okr.key_results?.length || 0} key result{(okr.key_results?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
